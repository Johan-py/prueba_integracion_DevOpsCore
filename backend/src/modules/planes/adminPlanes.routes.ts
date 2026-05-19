import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { listarPlanes, crearPlan, actualizarPlan, eliminarPlan } from './adminPlanes.controller.js'

const router = Router()

router.get('/planes', requireAuth, listarPlanes)
router.post('/planes', requireAuth, crearPlan)
router.put('/planes/:id', requireAuth, actualizarPlan)
router.delete('/planes/:id', requireAuth, eliminarPlan)

export default router
