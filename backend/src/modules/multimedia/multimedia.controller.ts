import { Request, Response } from 'express'
import {
  getPublicationMultimediaService,
  registerImagesService,
  registerVideoLinkService
} from './multimedia.service.js'

export const getPublicationMultimediaController = async (req: Request, res: Response) => {
  try {
    const publicacionId = Number(req.params.publicacionId)
    const usuarioId = Number(req.query.usuarioId)

    const result = await getPublicationMultimediaService({
      publicacionId,
      usuarioId
    })

    res.json({
      message: 'Multimedia obtenida correctamente',
      data: result
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error interno del servidor'

    res.status(400).json({ message })
  }
}

export const registerVideoLinkController = async (req: Request, res: Response) => {
  try {
    const publicacionId = Number(req.params.publicacionId)
    const { usuarioId, videoUrl } = req.body as {
      usuarioId: number
      videoUrl: string
    }

    const result = await registerVideoLinkService({
      publicacionId,
      usuarioId: Number(usuarioId),
      videoUrl
    })

    res.json({
      message: 'Video registrado correctamente',
      data: result
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error interno del servidor'

    res.status(400).json({ message })
  }
}

export const registerImagesController = async (req: Request, res: Response) => {
  try {
    const publicacionId = Number(req.params.publicacionId)
    const { usuarioId, images } = req.body as {
      usuarioId: number
      images: { url: string; extension: string; pesoMb: number }[]
    }

    const result = await registerImagesService({
      publicacionId,
      usuarioId: Number(usuarioId),
      images
    })

    res.json({
      message: 'Imágenes registradas correctamente',
      data: result
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error interno del servidor'

    res.status(400).json({ message })
  }
}