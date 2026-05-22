import type { Request, Response } from 'express'
import { suscripcionesService } from './suscripciones.service.js'
import { prisma } from '../../lib/prisma.client.js'

interface AuthRequest extends Request {
  user?: { id: number }
}

export const obtenerMiSuscripcion = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'No autenticado' })

    const suscripcion = await suscripcionesService.obtenerSuscripcionActiva(userId)

    if (suscripcion) {
      return res.json({
        activa: true,
        idSuscripcion: suscripcion.id_suscripcion,
        planNombre: suscripcion.plan_suscripcion?.nombre_plan ?? null,
        precioPlan: suscripcion.plan_suscripcion?.precio_plan
          ? Number(suscripcion.plan_suscripcion.precio_plan)
          : null,
        fechaInicio: suscripcion.fecha_inicio,
        fechaFin: suscripcion.fecha_fin,
      })
    }

    // Check for most recent expired subscription
    const expirada = await prisma.suscripciones_activas.findFirst({
      where: { id_usuario: userId },
      include: { plan_suscripcion: true },
      orderBy: { fecha_fin: 'desc' },
    })

    if (expirada) {
      return res.json({
        activa: false,
        expirado: true,
        idSuscripcion: expirada.id_suscripcion,
        planNombre: expirada.plan_suscripcion?.nombre_plan ?? null,
        precioPlan: expirada.plan_suscripcion?.precio_plan
          ? Number(expirada.plan_suscripcion.precio_plan)
          : null,
        fechaInicio: expirada.fecha_inicio,
        fechaFin: expirada.fecha_fin,
      })
    }

    return res.json({ activa: false, idSuscripcion: null, planNombre: null, precioPlan: null })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Error interno',
    })
  }
}
