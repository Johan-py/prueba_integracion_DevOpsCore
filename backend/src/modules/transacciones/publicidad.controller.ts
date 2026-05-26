import type { Request, Response } from 'express'
import { crearOrdenPublicidad } from './publicidad.service.js'

interface AuthRequest extends Request {
  user?: { id: number }
}

const ERROR_STATUS: Record<string, number> = {
  PLAN_PUBLICIDAD_INVALIDO: 400,
  PUBLICACION_NO_EXISTE: 404,
  NO_AUTORIZADO: 403,
  PUBLICACION_YA_ELIMINADA: 409,
  PUBLICACION_YA_PUBLICITADA: 409,
  SIN_PLAN_PARA_QR: 500,
}

/**
 * POST /api/transacciones/publicidad/crear-sesion
 * Body: { publicacionId: number, planId: 1 | 2 }
 * Crea la orden de pago para publicitar una publicación y devuelve REF + QR.
 */
export const crearSesionPublicidad = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.user?.id
    if (!usuarioId) {
      return res.status(401).json({ ok: false, message: 'No autenticado' })
    }

    const publicacionId = Number(req.body?.publicacionId)
    const planId = Number(req.body?.planId)

    if (!Number.isInteger(publicacionId) || publicacionId <= 0) {
      return res.status(400).json({ ok: false, message: 'publicacionId inválido' })
    }
    if (![1, 2].includes(planId)) {
      return res.status(400).json({ ok: false, message: 'planId debe ser 1 (Básico) o 2 (Premium)' })
    }

    const orden = await crearOrdenPublicidad(usuarioId, publicacionId, planId)
    return res.status(201).json({ ok: true, data: orden })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error interno'
    return res.status(ERROR_STATUS[msg] ?? 500).json({ ok: false, message: msg })
  }
}

