import type { Request, Response } from 'express'
import type { Express } from 'express'
import { uploadImageToCloudinary } from './cloudinary.service.js'
import {
  getPublicationMultimediaService,
  registerImagesService,
  registerVideoLinkService
} from './multimedia.service.js'
import type { ImageUploadItemInput, RegisterVideoLinkBody } from './multimedia.types.js'

type AuthenticatedRequest = Request & {
  user?: {
    id?: number
    email?: string
  }
  files?: Express.Multer.File[]
}

const parsePublicacionId = (req: Request): number => {
  const publicacionId = Number(req.params.publicacionId)

  if (!Number.isInteger(publicacionId) || publicacionId <= 0) {
    throw new Error('ID de publicación no válido')
  }

  return publicacionId
}

const getAuthenticatedUserId = (req: AuthenticatedRequest): number => {
  const usuarioId = Number(req.user?.id)

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error('Usuario no autenticado')
  }

  return usuarioId
}

const getErrorStatus = (message: string): number => {
  switch (message) {
    case 'Usuario no autenticado':
      return 401
    case 'La publicación no existe':
      return 404
    case 'La publicación no pertenece al usuario autenticado':
      return 403
    case 'ID de publicación no válido':
    case 'El enlace de video es obligatorio':
    case 'Enlace de video no válido':
    case 'Debe enviar al menos una imagen':
    case 'Límite de imágenes alcanzado':
    case 'Límite de videos alcanzado':
      return 400
    default:
      if (
        message.includes('no válido') ||
        message.includes('no válida') ||
        message.includes('obligatoria') ||
        message.includes('Formato no permitido') ||
        message.includes('supera el tamaño máximo permitido')
      ) {
        return 400
      }

      return 500
  }
}

const handleControllerError = (error: unknown, res: Response) => {
  const message = error instanceof Error ? error.message : 'Error interno del servidor'
  const status = getErrorStatus(message)

  if (status === 500) {
    console.error('[multimedia.controller] Error inesperado:', error)
  }

  return res.status(status).json({
    message: status === 500 ? 'Error interno del servidor' : message
  })
}

export const getPublicationMultimediaController = async (req: Request, res: Response) => {
  try {
    const publicacionId = parsePublicacionId(req)
    const usuarioId = getAuthenticatedUserId(req as AuthenticatedRequest)

    const result = await getPublicationMultimediaService({
      publicacionId,
      usuarioId
    })

    return res.json({
      message: 'Multimedia obtenida correctamente',
      data: result
    })
  } catch (error) {
    return handleControllerError(error, res)
  }
}

export const registerVideoLinkController = async (req: Request, res: Response) => {
  try {
    const publicacionId = parsePublicacionId(req)
    const usuarioId = getAuthenticatedUserId(req as AuthenticatedRequest)
    const { videoUrl } = req.body as Partial<RegisterVideoLinkBody>

    const result = await registerVideoLinkService({
      publicacionId,
      usuarioId,
      videoUrl: typeof videoUrl === 'string' ? videoUrl : ''
    })

    return res.status(201).json({
      message: 'Video registrado correctamente',
      data: result
    })
  } catch (error) {
    return handleControllerError(error, res)
  }
}

export const registerImagesController = async (req: Request, res: Response) => {
  try {
    const publicacionId = parsePublicacionId(req)
    const usuarioId = getAuthenticatedUserId(req as AuthenticatedRequest)
    const files = (req as AuthenticatedRequest).files ?? []

    if (files.length === 0) {
      throw new Error('Debe enviar al menos una imagen')
    }

    const normalizedImages: ImageUploadItemInput[] = await Promise.all(
      files.map(async (file) => {
        const extension = file.originalname.split('.').pop()?.toLowerCase() ?? ''
        const uploadedImage = await uploadImageToCloudinary(file, publicacionId)

        return {
          url: uploadedImage.url,
          extension,
          pesoMb: uploadedImage.pesoMb
        }
      })
    )

    const result = await registerImagesService({
      publicacionId,
      usuarioId,
      images: normalizedImages
    })

    return res.status(201).json({
      message: 'Imágenes registradas correctamente',
      data: result
    })
  } catch (error) {
    return handleControllerError(error, res)
  }
}