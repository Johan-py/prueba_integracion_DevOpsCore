import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import {
  getTagsController,
  getTagsByPublicacionController,
  replacePublicacionTagsController
} from './tags.controller.js'
import { replaceTagsRules } from './tags.validator.js'

const router = Router()

// Obtener todos los tags (para sugerencias)
router.get('/', getTagsController)

// Obtener tags de una publicación
router.get('/publicaciones/:publicacionId', getTagsByPublicacionController)

// Reemplazar tags de una publicación
router.put(
  '/publicaciones/:publicacionId',
  requireAuth,
  replaceTagsRules,
  replacePublicacionTagsController
)

export default router
