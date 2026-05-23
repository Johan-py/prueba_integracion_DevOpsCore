import { Router } from 'express'
import { crearPoi } from './pois.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'

const router = Router()

router.post('/inmueble/:inmueble_id', requireAuth, crearPoi)

export default router

