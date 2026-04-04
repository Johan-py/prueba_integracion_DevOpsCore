import { Router } from 'express'
import { getConsumo } from '../controllers/consumo.controller.js'
// import { verifyToken } from '../middleware/auth.middleware.js'

const router = Router()

// 🔥 SIN TOKEN (para probar)
router.get('/consumo/:userId', getConsumo)

export default router
