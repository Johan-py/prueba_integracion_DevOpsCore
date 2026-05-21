import type { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.client.js'


export const crearOrdenCobro = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { planId, tipo } = req.body

    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' })
    }

    if (!planId || !tipo) {
      return res.status(400).json({ error: 'Faltan datos' })
    }

    const plan = await prisma.plan_suscripcion.findUnique({
      where: { id: planId }
    })

    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado' })
    }

    const ahora = new Date()
    const fechaFin = new Date()
    let montoBruto = 0
    let descuento = 0
    let montoNeto = 0

    if (tipo === 'mensual') {
      montoBruto = plan.precio_plan?.toNumber() || 0
      montoNeto = montoBruto
      fechaFin.setDate(ahora.getDate() + 30)
    } else if (tipo === 'anual') {
      montoBruto = (plan.precio_plan?.toNumber() || 0) * 12
      descuento = montoBruto * 0.1
      montoNeto = montoBruto - descuento
      fechaFin.setDate(ahora.getDate() + 365)
    } else {
      return res.status(400).json({ error: 'Tipo inválido' })
    }

    if (montoNeto < 0) {
      return res.status(400).json({ error: 'Error de cálculo, total no válido' })
    }

    const suscripcion = await prisma.suscripciones_activas.create({
      data: {
        id_usuario: userId,
        id_suscripcion: planId,
        fecha_inicio: ahora,
        fecha_fin: fechaFin,
        estado: 'activa'
      }
    })

    const transaccion = await prisma.transacciones.create({
      data: {
        id_usuario: userId,
        id_suscripcion: planId,
        subtotal: montoBruto,
        iva_porcentaje: 13,
        iva_monto: 0,
        total: montoNeto,
        metodo_pago: 'QR_BANCARIO',
        estado: 'PENDIENTE'
      }
    })

    res.status(201).json({
      message: 'Orden creada exitosamente',
      suscripcion,
      transaccion
    })
  } catch (error) {
    console.error('Error al crear orden:', error)
    res.status(500).json({ error: 'Error del servidor' })
  }
}

export const listarOrdenes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' })
    }

    const ordenes = await prisma.transacciones.findMany({
      where: { id_usuario: userId },
      include: { plan_suscripcion: true },
      orderBy: { fecha_intento: 'desc' }
    })

    res.json(ordenes)
  } catch (error) {
    console.error('Error al listar órdenes:', error)
    res.status(500).json({ error: 'Error del servidor' })
  }
}

export const cancelarOrden = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const transaccionId = parseInt(req.params.id as string)

    if (isNaN(transaccionId)) {
      return res.status(400).json({ error: 'ID de orden inválido' })
    }

    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' })
    }

    const transaccion = await prisma.transacciones.findFirst({
      where: { id: transaccionId, id_usuario: userId, estado: 'PENDIENTE' }
    })

    if (!transaccion) {
      return res.status(404).json({ error: 'Orden no encontrada o ya fue pagada' })
    }

    const ordenActualizada = await prisma.transacciones.update({
      where: { id: transaccionId },
      data: { estado: 'CANCELADO' }
    })

    res.json({ message: 'Orden cancelada exitosamente', orden: ordenActualizada })
  } catch (error) {
    console.error('Error al cancelar orden:', error)
    res.status(500).json({ error: 'Error del servidor' })
  }
}

export const cambiarPlan = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { transaccionId, nuevoPlanId } = req.body

    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' })
    }

    const transaccion = await prisma.transacciones.findFirst({
      where: { id: transaccionId, id_usuario: userId, estado: 'PENDIENTE' }
    })

    if (!transaccion) {
      return res.status(404).json({ error: 'Orden no encontrada o ya fue pagada' })
    }

    const plan = await prisma.plan_suscripcion.findUnique({
      where: { id: nuevoPlanId }
    })

    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado' })
    }

    const nuevoTotal = plan.precio_plan?.toNumber() || 0
    if (nuevoTotal < 0) {
      return res.status(400).json({ error: 'Error de cálculo, total no válido' })
    }

    const ordenActualizada = await prisma.transacciones.update({
      where: { id: transaccionId },
      data: { total: nuevoTotal, id_suscripcion: nuevoPlanId }
    })

    res.json({ message: 'Plan actualizado correctamente', orden: ordenActualizada })
  } catch (error) {
    console.error('Error al cambiar plan:', error)
    res.status(500).json({ error: 'Error del servidor' })
  }
}
