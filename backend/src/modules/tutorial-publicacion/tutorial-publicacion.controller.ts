import type { Request, Response } from 'express'
import {
  confirmTutorialPublicacionService,
  getTutorialPublicacionContentService,
  getTutorialPublicacionEstadoService
} from './tutorial-publicacion.service.js'

type AuthenticatedRequest = Request & {
  user?: {
    id?: number
  }
}

const getAuthenticatedUserId = (req: AuthenticatedRequest): number => {
  const usuarioId = Number(req.user?.id)

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error('Usuario no autenticado')
  }

  return usuarioId
}

export const getTutorialPublicacionContentController = async (
  _req: Request,
  res: Response
) => {
  try {
    const result = await getTutorialPublicacionContentService()

    return res.status(200).json({
      ok: true,
      data: result
    })
  } catch (error) {
    console.error('Error al obtener contenido del tutorial:', error)

    return res.status(500).json({
      ok: false,
      message: 'No se pudo obtener el contenido del tutorial'
    })
  }
}

export const getTutorialPublicacionEstadoController = async (
  req: Request,
  res: Response
) => {
  try {
    const usuarioId = getAuthenticatedUserId(req as AuthenticatedRequest)
    const result = await getTutorialPublicacionEstadoService({ usuarioId })

    return res.status(200).json({
      ok: true,
      data: result
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Usuario no autenticado') {
      return res.status(401).json({
        ok: false,
        message: 'Usuario no autenticado'
      })
    }

    console.error('Error al obtener estado del tutorial:', error)

    return res.status(500).json({
      ok: false,
      message: 'No se pudo obtener el estado del tutorial'
    })
  }
}

export const confirmTutorialPublicacionController = async (
  req: Request,
  res: Response
) => {
  try {
    const usuarioId = getAuthenticatedUserId(req as AuthenticatedRequest)
    const result = await confirmTutorialPublicacionService({ usuarioId })

    return res.status(200).json({
      ok: true,
      data: result
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Usuario no autenticado') {
      return res.status(401).json({
        ok: false,
        message: 'Usuario no autenticado'
      })
    }

    console.error('Error al confirmar tutorial:', error)

    return res.status(500).json({
      ok: false,
      message: 'No se pudo confirmar el tutorial'
    })
  }
}