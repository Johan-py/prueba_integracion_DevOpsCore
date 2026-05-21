import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../../middleware/auth.middleware.js'
import {
  getPublicationMultimediaController,
  registerImagesController,
  registerVideoLinkController
} from './multimedia.controller.js'

const multimediaRoutes = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg']

    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error('Formato no permitido. Solo PNG, JPG o JPEG'))
      return
    }

    cb(null, true)
  }
})

multimediaRoutes.get('/:publicacionId/multimedia', requireAuth, getPublicationMultimediaController)

multimediaRoutes.post(
  '/:publicacionId/multimedia/video-link',
  requireAuth,
  registerVideoLinkController
)

multimediaRoutes.post(
  '/:publicacionId/multimedia/images',
  requireAuth,
  upload.array('images', 5),
  registerImagesController
)

export default multimediaRoutes
