import { Router } from 'express'
import { crearPagoUsdt, verificarPagoUsdt, obtenerTipoCambio } from './usdt.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'

const router = Router()

router.get('/tipo-cambio', requireAuth, obtenerTipoCambio)
router.post('/', requireAuth, crearPagoUsdt)
router.post('/:id/verificar', requireAuth, verificarPagoUsdt)

export default router
