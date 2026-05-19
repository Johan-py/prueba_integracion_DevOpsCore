import type { Request, Response } from 'express'
import { Readable } from 'stream'
import { prisma } from '../../lib/prisma.client.js'
import { cloudinary } from '../../config/cloudinary.js'
import { crearTransaccion } from './servicios/transaccion.service.js'
import { emitirComprobante } from './servicios/comprobanteService.js'
import { suscripcionesService } from '../suscripciones/suscripciones.service.js'
import { createNotificationService } from '../notificaciones/notificaciones.service.js'

interface AuthRequest extends Request {
  user?: { id: number }
}

const toMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Error interno'

export const generarPagoQr = async (req: AuthRequest, res: Response) => {
  try {
    const { idSuscripcion, userId } = req.body
    const usuarioId: number = req.user?.id ?? userId ?? 1

    if (!idSuscripcion) {
      return res.status(400).json({ error: 'Falta idSuscripcion' })
    }

    const { transaccion, plan } = await crearTransaccion(usuarioId, parseInt(idSuscripcion))

    return res.status(201).json({
      id: transaccion.id,
      id_usuario: transaccion.id_usuario,
      id_suscripcion: transaccion.id_suscripcion,
      subtotal: Number(transaccion.subtotal),
      iva_porcentaje: transaccion.iva_porcentaje,
      iva_monto: Number(transaccion.iva_monto),
      total: Number(transaccion.total),
      metodo_pago: transaccion.metodo_pago,
      fecha_intento: transaccion.fecha_intento,
      estado: transaccion.estado,
      verificacion_requerida: transaccion.verificacion_requerida,
      monto_descuento: Number(transaccion.monto_descuento ?? 0),
      referencia: `REF-${transaccion.id}`,
      fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      qrContent: plan.imagen_gr_url ?? null,
      plan_suscripcion: {
        nombre_plan: plan.nombre_plan,
        precio_plan: Number(plan.precio_plan),
        nro_publicaciones_plan: plan.nro_publicaciones_plan,
        duración_plan_días: plan.duracion_plan_dias,
        fotos_galeria: null,
        imagen_gr_url: plan.imagen_gr_url,
      },
    })
  } catch (error) {
    const msg = toMessage(error)
    const status = msg === 'Plan no encontrado' ? 404 : 500
    return res.status(status).json({ error: msg })
  }
}

export const aplicarCupon = async (req: Request, res: Response) => {
  try {
    const transaccionId = parseInt(String(req.params.id))
    const { codigo, totalOriginal } = req.body

    if (!codigo) return res.status(400).json({ error: 'Ingresa un código' })
    if (totalOriginal === undefined || isNaN(Number(totalOriginal))) {
      return res.status(400).json({ error: 'Monto no válido' })
    }

    const cupon = await prisma.cupon.findUnique({
      where: { codigo: String(codigo).toUpperCase() },
    })
    if (!cupon) return res.status(400).json({ error: 'Código inválido' })

    if (cupon.usos_actuales >= cupon.max_usos) {
      return res.status(400).json({ error: 'Cupón agotado' })
    }

    const transaccion = await prisma.transacciones.findUnique({ where: { id: transaccionId } })
    if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' })
    if (transaccion.cupon_id) return res.status(400).json({ error: 'Ya se aplicó un descuento' })

    const cuponValor = Number(cupon.valor_descuento)
    let montoDescuento = cupon.tipo_descuento === 'PORCENTAJE'
      ? Number(totalOriginal) * (cuponValor / 100)
      : Math.min(cuponValor, Number(totalOriginal))
    montoDescuento = Number(montoDescuento.toFixed(2))
    const nuevoTotal = Number((Number(totalOriginal) - montoDescuento).toFixed(2))

    await prisma.transacciones.update({
      where: { id: transaccionId },
      data: { cupon_id: cupon.id, monto_descuento: montoDescuento, total: nuevoTotal },
    })

    return res.json({ total: nuevoTotal, montoDescuento })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const obtenerPagoPendiente = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(String(req.params.userId))

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'userId inválido' })
    }

    const transaccion = await prisma.transacciones.findFirst({
      where: { id_usuario: userId, estado: 'PENDIENTE' },
      include: { plan_suscripcion: true },
      orderBy: { fecha_intento: 'desc' }
    })

    if (!transaccion) {
      return res.status(404).json({ error: 'No hay pagos pendientes' })
    }

    return res.json({
      id: transaccion.id,
      monto: Number(transaccion.total),
      referencia: `REF-${transaccion.id}`,
      estado: transaccion.estado?.toLowerCase() ?? 'pendiente',
      qrContent: transaccion.plan_suscripcion?.imagen_gr_url ?? null,
      fechaExpiracion: new Date(
        (transaccion.fecha_intento?.getTime() ?? Date.now()) + 30 * 60 * 1000
      ).toISOString(),
      subtotal: Number(transaccion.subtotal),
      iva_monto: Number(transaccion.iva_monto),
      planNombre: transaccion.plan_suscripcion?.nombre_plan ?? null,
      planId: transaccion.id_suscripcion,
      tipoFacturacion: transaccion.metodo_pago === 'QR_BANCARIO_ANUAL' ? 'anual' : 'mensual',
    })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const consultarEstadoPago = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const transaccion = await prisma.transacciones.findUnique({ where: { id } })

    if (!transaccion) {
      return res.status(404).json({ error: 'Transacción no encontrada' })
    }

    const estadoRaw = transaccion.estado?.toLowerCase() ?? 'pendiente'
    const estado = estadoRaw === 'completado' ? 'pagado' : estadoRaw
    return res.json({ estado })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const confirmarPago = async (req: Request, res: Response) => {
  try {
    const transaccionId = parseInt(String(req.params.id))

    if (isNaN(transaccionId)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const transaccion = await prisma.transacciones.findUnique({
      where: { id: transaccionId },
      include: {
        usuario: { select: { correo: true, nombre: true } },
        plan_suscripcion: { select: { nombre_plan: true } },
      },
    })

    if (!transaccion) {
      return res.status(404).json({ error: 'Transacción no encontrada' })
    }

    if (transaccion.estado === 'COMPLETADO') {
      return res.status(409).json({ error: 'La transacción ya fue confirmada' })
    }

    const suscripcionVigente = await suscripcionesService.obtenerSuscripcionActiva(
      transaccion.id_usuario!
    )
    if (suscripcionVigente) {
      const planVigente = suscripcionVigente.plan_suscripcion?.nombre_plan ?? 'activa'
      const fechaFin = suscripcionVigente.fecha_fin.toISOString().slice(0, 10)
      return res.status(409).json({
        error: `El usuario ya tiene una suscripción ${planVigente} vigente hasta ${fechaFin}`,
      })
    }

    const ahora = new Date()

    await prisma.transacciones.update({
      where: { id: transaccionId },
      data: { estado: 'COMPLETADO', fecha_completado: ahora },
    })

    const esAnual = transaccion.metodo_pago === 'QR_BANCARIO_ANUAL'
    const diasSuscripcion = esAnual ? 365 : 30

    await prisma.suscripciones_activas.create({
      data: {
        id_usuario: transaccion.id_usuario!,
        id_suscripcion: transaccion.id_suscripcion!,
        id_transaccion: transaccionId,
        fecha_inicio: ahora,
        fecha_fin: new Date(ahora.getTime() + diasSuscripcion * 24 * 60 * 60 * 1000),
        estado: 'ACTIVA',
      },
    })

    const comprobanteEnviado = await emitirComprobante(transaccionId)

    try {
      const fechaAprobacion = ahora.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
      const fechaVencimiento = new Date(ahora.getTime() + diasSuscripcion * 24 * 60 * 60 * 1000)
        .toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
      await createNotificationService({
        correo: transaccion.usuario.correo,
        titulo: '¡Tu pago fue confirmado!',
        mensaje: `Tu pago del plan ${transaccion.plan_suscripcion?.nombre_plan ?? '—'} (REF-${transaccionId}) fue aprobado el ${fechaAprobacion}. Tu suscripción ya está activa y vence el ${fechaVencimiento}.`,
      })
    } catch { /* no bloquea el flujo */ }

    return res.status(200).json({
      mensaje: comprobanteEnviado
        ? 'Pago confirmado y comprobante enviado'
        : 'Pago confirmado, fallo al enviar comprobante',
    })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const actualizarTransaccion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

    const { tipoFacturacion, totalFinal } = req.body
    if (!tipoFacturacion || totalFinal === undefined) {
      return res.status(400).json({ error: 'Faltan parámetros: tipoFacturacion y totalFinal' })
    }

    const transaccion = await prisma.transacciones.findUnique({ where: { id } })
    if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' })
    if (transaccion.estado !== 'PENDIENTE') {
      return res.status(400).json({ error: 'Solo se pueden modificar transacciones PENDIENTES' })
    }

    const total = Math.round(Number(totalFinal) * 100) / 100
    const subtotal = Math.round((total / 1.13) * 100) / 100
    const iva_monto = Math.round((total - subtotal) * 100) / 100
    const metodo_pago = tipoFacturacion === 'anual' ? 'QR_BANCARIO_ANUAL' : 'QR_BANCARIO_MENSUAL'

    await prisma.transacciones.update({
      where: { id },
      data: { total, subtotal, iva_monto, metodo_pago },
    })

    return res.json({ total, subtotal, iva_monto, tipoFacturacion })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const listarTransaccionesAdmin = async (_req: Request, res: Response) => {
  try {
    const transacciones = await prisma.transacciones.findMany({
      include: {
        usuario: { select: { nombre: true, apellido: true, correo: true } },
        plan_suscripcion: { select: { nombre_plan: true } },
      },
      orderBy: { fecha_intento: 'desc' },
    })

    return res.json(
      transacciones.map((t) => ({
        id: t.id,
        usuario: `${t.usuario.nombre} ${t.usuario.apellido}`,
        correo: t.usuario.correo,
        referencia: `REF-${t.id}`,
        monto: Number(t.total),
        fecha: t.fecha_intento,
        estado: t.estado ?? 'PENDIENTE',
        plan: t.plan_suscripcion?.nombre_plan ?? null,
      }))
    )
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const listarMisTransacciones = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.user?.id
    if (!usuarioId) return res.status(401).json({ error: 'No autenticado' })

    const transacciones = await prisma.transacciones.findMany({
      where: { id_usuario: usuarioId },
      include: { plan_suscripcion: { select: { nombre_plan: true } } },
      orderBy: { fecha_intento: 'desc' },
    })

    return res.json(
      transacciones.map((t) => ({
        id: t.id,
        referencia: `REF-${t.id}`,
        plan: t.plan_suscripcion?.nombre_plan ?? '—',
        subtotal: Number(t.subtotal),
        iva_monto: Number(t.iva_monto),
        total: Number(t.total),
        monto_descuento: Number(t.monto_descuento ?? 0),
        metodo_pago: t.metodo_pago ?? 'QR_BANCARIO',
        estado: t.estado ?? 'PENDIENTE',
        fecha: t.fecha_intento,
        fecha_completado: t.fecha_completado,
      }))
    )
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const notificarAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

    // Deduplication: check if admin was already notified for this transaction
    const yaNotificado = await prisma.bitacora_pagos.findFirst({
      where: { id_transaccion: id, evento: 'ADMIN_NOTIFICADO' },
    })
    if (yaNotificado) {
      return res.json({ ok: true, notificados: 0, deduplicado: true })
    }

    const transaccion = await prisma.transacciones.findUnique({
      where: { id },
      include: {
        usuario: { select: { nombre: true, apellido: true, correo: true } },
        plan_suscripcion: { select: { nombre_plan: true } },
      },
    })
    if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' })

    const admins = await prisma.usuario.findMany({
      where: { rol: { nombre: 'ADMIN' } },
      select: { correo: true },
    })

    const nombreUsuario = `${transaccion.usuario.nombre} ${transaccion.usuario.apellido}`
    const planNombre = transaccion.plan_suscripcion?.nombre_plan ?? '—'
    const monto = `Bs. ${Number(transaccion.total).toFixed(2)}`
    const metodo = transaccion.metodo_pago ?? 'QR_BANCARIO'
    const fechaHora = new Date().toLocaleString('es-BO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

    await Promise.allSettled(
      admins.map((a) =>
        createNotificationService({
          correo: a.correo,
          titulo: 'Nuevo pago pendiente de verificación',
          mensaje: `${nombreUsuario} indica haber realizado el pago REF-${id} del plan ${planNombre}. Monto: ${monto} · Método: ${metodo} · Fecha: ${fechaHora}. Revisa el panel de pagos.`,
        })
      )
    )

    // Mark as notified to prevent duplicates
    await prisma.bitacora_pagos.create({
      data: {
        id_usuario: transaccion.id_usuario,
        id_suscripcion: transaccion.id_suscripcion,
        id_transaccion: id,
        evento: 'ADMIN_NOTIFICADO',
        mensaje: `Admin notificado el ${fechaHora}`,
      },
    })

    return res.json({ ok: true, notificados: admins.length })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const rechazarPago = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

    const { motivo } = req.body as { motivo?: string }
    if (!motivo || !motivo.trim()) {
      return res.status(400).json({ error: 'El motivo de rechazo es requerido' })
    }

    const transaccion = await prisma.transacciones.findUnique({
      where: { id },
      include: {
        usuario: { select: { correo: true } },
        plan_suscripcion: { select: { nombre_plan: true } },
      },
    })
    if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' })

    if (transaccion.estado !== 'PENDIENTE') {
      return res.status(400).json({ error: 'Solo se pueden rechazar transacciones PENDIENTES' })
    }

    await prisma.transacciones.update({
      where: { id },
      data: { estado: 'RECHAZADO' },
    })

    await prisma.bitacora_pagos.create({
      data: {
        id_usuario: transaccion.id_usuario,
        id_suscripcion: transaccion.id_suscripcion,
        id_transaccion: id,
        evento: 'PAGO_RECHAZADO',
        mensaje: `Transacción ${id} rechazada por el administrador. Motivo: ${motivo}`,
      },
    })

    try {
      await createNotificationService({
        correo: transaccion.usuario.correo,
        titulo: 'Pago rechazado',
        mensaje: `Tu pago del plan ${transaccion.plan_suscripcion?.nombre_plan ?? '—'} (REF-${id}) fue rechazado. Motivo: ${motivo}`,
      })
    } catch { /* no bloquea el flujo */ }

    return res.json({ mensaje: 'Pago rechazado correctamente' })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const subirComprobante = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

    const file = (req as Request & { file?: Express.Multer.File }).file
    if (!file) return res.status(400).json({ error: 'No se recibió archivo' })

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Formato no válido. Solo JPG, PNG o PDF.' })
    }

    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'El archivo supera el límite de 5 MB.' })
    }

    const transaccion = await prisma.transacciones.findUnique({ where: { id } })
    if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' })

    const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image'

    const url = await new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'comprobantes', resource_type: resourceType, public_id: `comprobante-${id}`, overwrite: true },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error('Error al subir a Cloudinary'))
          resolve(result.secure_url)
        }
      )
      Readable.from(file.buffer).pipe(stream)
    })

    await prisma.bitacora_pagos.create({
      data: {
        id_usuario: transaccion.id_usuario,
        id_suscripcion: transaccion.id_suscripcion,
        id_transaccion: id,
        evento: 'COMPROBANTE_SUBIDO',
        mensaje: url,
      },
    })

    return res.json({ ok: true, url })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}

export const cancelarTransaccion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id))

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const transaccion = await prisma.transacciones.findUnique({ where: { id } })

    if (!transaccion) {
      return res.status(404).json({ error: 'Transacción no encontrada' })
    }

    if (transaccion.estado !== 'PENDIENTE') {
      return res.status(400).json({ error: 'Solo se pueden cancelar transacciones PENDIENTES' })
    }

    await prisma.transacciones.update({
      where: { id },
      data: { estado: 'CANCELADO' }
    })

    await prisma.bitacora_pagos.create({
      data: {
        id_usuario: transaccion.id_usuario,
        id_suscripcion: transaccion.id_suscripcion,
        id_transaccion: id,
        evento: 'TRANSACCION_CANCELADA',
        mensaje: `Transacción ${id} cancelada por el usuario`
      }
    })

    return res.json({ message: 'Transacción cancelada correctamente' })
  } catch (error) {
    return res.status(500).json({ error: toMessage(error) })
  }
}
