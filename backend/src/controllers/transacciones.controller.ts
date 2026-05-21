import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.client.js'
import { emitirComprobante } from '../modules/transacciones/servicios/comprobanteService.js'

// Generar Pago QR
export const generarPagoQr = async (req: Request, res: Response): Promise<void> => {
  try {
    const { suscripcionId = 1 } = req.body

    const usuario = await prisma.usuario.findFirst()

    if (!usuario) {
      res.status(400).json({ error: 'No hay usuarios en la base de datos' })
      return
    }

    const plan = await prisma.plan_suscripcion.findUnique({
      where: { id: Number(suscripcionId) }
    })

    if (!plan) {
      res.status(404).json({ error: 'Plan no existe' })
      return
    }

    const subtotal = Number(plan.precio_plan || 0)
    const iva_porcentaje = 0
    const iva_monto = 0
    const total = subtotal

    const nuevoPago = await prisma.transacciones.create({
      data: {
        id_usuario: usuario.id,
        id_suscripcion: plan.id,
        subtotal,
        iva_porcentaje,
        iva_monto,
        total,
        metodo_pago: 'QR_BANCARIO',
        estado: 'PENDIENTE',
        verificacion_requerida: true
      }
    })

    res.status(200).json({
      mensaje: 'Pago generado con éxito',
      pago: nuevoPago
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno al generar el pago QR' })
  }
}

// Obtener pago pendiente
export const obtenerPagoPendiente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usuarioId } = req.params

    const pagoPendiente = await prisma.transacciones.findFirst({
      where: {
        id_usuario: Number(usuarioId),
        estado: 'PENDIENTE'
      },
      orderBy: { fecha_intento: 'desc' }
    })

    if (!pagoPendiente) {
      res.status(404).json({ mensaje: 'Sin pagos pendientes', pago: null })
      return
    }

    const fechaIntento = pagoPendiente.fecha_intento
      ? new Date(pagoPendiente.fecha_intento)
      : new Date()

    const fechaExpiracion = new Date(fechaIntento.getTime() + 5 * 60000)

    res.status(200).json({
      id: pagoPendiente.id.toString(),
      monto: Number(pagoPendiente.total),
      referencia: `PAY-${pagoPendiente.id}`,
      qrContent: '000201010211_TU_CODIGO_QR_BANCARIO_AQUI',
      estado: pagoPendiente.estado?.toLowerCase(),
      fechaExpiracion: fechaExpiracion.toISOString()
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al recuperar pago pendiente' })
  }
}

export const consultarEstadoPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const pago = await prisma.transacciones.findUnique({
      where: { id: Number(id) },
      select: { estado: true }
    })

    if (!pago) {
      res.status(404).json({ error: 'Pago no encontrado' })
      return
    }

    res.status(200).json({ estado: pago.estado?.toLowerCase() })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al consultar estado' })
  }
}

export const confirmarPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const transaccionId = Number(id)

    const transaccion = await prisma.transacciones.findUnique({
      where: { id: transaccionId },
      select: { estado: true, id_usuario: true, id_suscripcion: true }
    })

    if (!transaccion) {
      res.status(404).json({ error: 'Transacción no encontrada' })
      return
    }

    if (transaccion.estado === 'COMPLETADO') {
      res.status(409).json({ error: 'La transacción ya fue confirmada' })
      return
    }

    const ahora = new Date()

    await prisma.transacciones.update({
      where: { id: transaccionId },
      data: { estado: 'COMPLETADO', fecha_completado: ahora }
    })

    await prisma.suscripciones_activas.create({
      data: {
        id_usuario: transaccion.id_usuario,
        id_suscripcion: transaccion.id_suscripcion,
        id_transaccion: transaccionId,
        fecha_inicio: ahora,
        fecha_fin: new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000),
        estado: 'ACTIVA'
      }
    })

    const comprobanteEnviado = await emitirComprobante(transaccionId)

    res.status(200).json({
      mensaje: comprobanteEnviado
        ? 'Pago confirmado y comprobante enviado'
        : 'Pago confirmado, fallo al enviar comprobante'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error interno'
    })
  }
}

// Actualizar estado
export const actualizarEstadoPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { nuevoEstado } = req.body

    const pagoActualizado = await prisma.transacciones.update({
      where: { id: Number(id) },
      data: {
        estado: nuevoEstado,
        fecha_completado: nuevoEstado === 'COMPLETADO' ? new Date() : null
      }
    })

    res.status(200).json({
      mensaje: 'Estado del pago actualizado',
      pago: pagoActualizado
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar el estado del pago' })
  }
}
