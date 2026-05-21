import { Router } from 'express'
import { getConsumo } from '../../modules/LimiteSuscripcion/consumo.controllers.js'
import { getPlanLimit } from '../../modules/LimiteSuscripcion/planController.js'
import { requireAuth } from '../../middleware/auth.middleware.js'

const router = Router()

router.get('/consumo/me', requireAuth, getConsumo)

router.get('/limite', getPlanLimit)
export default router
