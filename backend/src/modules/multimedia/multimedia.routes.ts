import { Router } from 'express'
import {
  getPublicationMultimediaController,
  registerImagesController,
  registerVideoLinkController
} from './multimedia.controller.js'

const multimediaRoutes = Router()

multimediaRoutes.get('/:publicacionId/multimedia', getPublicationMultimediaController)
multimediaRoutes.post('/:publicacionId/multimedia/video-link', registerVideoLinkController)
multimediaRoutes.post('/:publicacionId/multimedia/images', registerImagesController)

export default multimediaRoutes