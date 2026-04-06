import { Router } from 'express'
import { verificarToken } from '../../middleware/auth'
import { getPlanes } from './plans.controller.js'

const router = Router()

router.get('/membership-plans', verificarToken, getPlanes)

export default router
