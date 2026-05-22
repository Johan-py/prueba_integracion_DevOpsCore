import type { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { parametrosPersonalizadosService } from './parametros.service.js'

type RequestWithUser = Request & {
  user?: {
    id: number
    correo: string
  }
}

export const getParametrosPersonalizados = async (_req: Request, res: Response) => {
  try {
    const data = await parametrosPersonalizadosService.getAll()

    return res.status(200).json({
      ok: true,
      data
    })
  } catch (error) {
    console.error('Error al listar parámetros personalizados:', error)

    return res.status(500).json({
      ok: false,
      message: 'INTERNAL_SERVER_ERROR',
      mensaje: 'Error al listar parámetros personalizados'
    })
  }
}

export const createParametroPersonalizado = async (req: Request, res: Response) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errores: errors.array().map((error) => ({
        campo: 'path' in error ? error.path : 'general',
        mensaje: error.msg
      }))
    })
  }

  if (!req.user?.id) {
    return res.status(401).json({
      ok: false,
      message: 'NOT_AUTHENTICATED',
      mensaje: 'Usuario no autenticado'
    })
  }

  try {
    const { nombre, descripcion } = req.body

    const data = await parametrosPersonalizadosService.createParameter(nombre, descripcion)

    return res.status(201).json({
      ok: true,
      mensaje: 'Parámetro personalizado creado correctamente',
      data
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'PARAMETER_ALREADY_EXISTS') {
      return res.status(409).json({
        ok: false,
        message: 'PARAMETER_ALREADY_EXISTS',
        mensaje: 'El parámetro personalizado ya existe'
      })
    }

    console.error('Error al crear parámetro personalizado:', error)

    return res.status(500).json({
      ok: false,
      message: 'INTERNAL_SERVER_ERROR',
      mensaje: 'Error al crear parámetro personalizado'
    })
  }
}

export const getPublicationParameters = async (req: Request, res: Response) => {
  try {
    const publicacionId = Number(req.params.publicacionId)

    const data = await parametrosPersonalizadosService.getPublicationParameters(publicacionId)

    return res.status(200).json({
      ok: true,
      data
    })
  } catch (error) {
    console.error('Error al listar parámetros de la publicación:', error)

    return res.status(500).json({
      ok: false,
      message: 'INTERNAL_SERVER_ERROR',
      mensaje: 'Error al listar parámetros de la publicación'
    })
  }
}

export const replacePublicationParameters = async (req: Request, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({
      ok: false,
      message: 'NOT_AUTHENTICATED',
      mensaje: 'Usuario no autenticado'
    })
  }

  try {
    const publicacionId = Number(req.params.publicacionId)
    const { parametros } = req.body

    const data = await parametrosPersonalizadosService.replacePublicationParameters(
      publicacionId,
      req.user.id,
      parametros ?? []
    )

    return res.status(200).json({
      ok: true,
      mensaje: 'Parámetros personalizados actualizados correctamente',
      data
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'PUBLICATION_NOT_FOUND') {
      return res.status(404).json({
        ok: false,
        message: 'PUBLICATION_NOT_FOUND',
        mensaje: 'La publicación no existe'
      })
    }

    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return res.status(403).json({
        ok: false,
        message: 'FORBIDDEN',
        mensaje: 'No tienes permiso para modificar esta publicación'
      })
    }

    console.error('Error al actualizar parámetros de la publicación:', error)

    return res.status(500).json({
      ok: false,
      message: 'INTERNAL_SERVER_ERROR',
      mensaje: 'Error al actualizar parámetros de la publicación'
    })
  }
}
