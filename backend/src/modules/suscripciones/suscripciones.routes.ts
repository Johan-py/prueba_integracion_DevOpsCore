import { Router } from 'express'
import { obtenerMiSuscripcion } from './suscripciones.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'

const router = Router()

router.get('/mi-suscripcion', requireAuth, obtenerMiSuscripcion)

export default router
