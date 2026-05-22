import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import {
  confirmTutorialPublicacionController,
  getTutorialPublicacionContentController,
  getTutorialPublicacionEstadoController
} from './tutorial-publicacion.controller.js'

const tutorialPublicacionRoutes = Router()

tutorialPublicacionRoutes.get(
  '/',
  requireAuth,
  getTutorialPublicacionContentController
)

tutorialPublicacionRoutes.get(
  '/estado',
  requireAuth,
  getTutorialPublicacionEstadoController
)

tutorialPublicacionRoutes.post(
  '/confirmar',
  requireAuth,
  confirmTutorialPublicacionController
)


export default tutorialPublicacionRoutes