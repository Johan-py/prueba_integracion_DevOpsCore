import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import {
  getTagsController,
  getTagsByPublicacionController,
  replacePublicacionTagsController,
  getTagsWithCountsController
} from './tags.controller.js'
import { replaceTagsRules } from './tags.validator.js'

const router = Router()

router.get('/', getTagsController)
router.get('/counts', getTagsWithCountsController)
router.get('/publicaciones/:publicacionId', getTagsByPublicacionController)

router.put(
  '/publicaciones/:publicacionId',
  requireAuth,
  replaceTagsRules,
  replacePublicacionTagsController
)

export default router

