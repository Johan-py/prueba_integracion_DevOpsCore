import { Router } from 'express'
import { verificarToken } from '../../middleware/auth.js'
import { getPlanes, getPlanById } from './plans.controller.js'
import { calcularPrecio } from './priceCalculator.controller.js'
import {
  crearOrdenCobro,
  listarOrdenes,
  cancelarOrden,
  cambiarPlan
} from './ordenCobro.controller.js'

const router = Router()

// HU-01
router.get('/membership-plans', verificarToken, getPlanes)
router.get('/:id', verificarToken, getPlanById)

// HU-07
router.post('/calcular-precio', verificarToken, calcularPrecio)
router.post('/crear-orden', verificarToken, crearOrdenCobro)
router.get('/mis-ordenes', verificarToken, listarOrdenes)
router.delete('/cancelar-orden/:id', verificarToken, cancelarOrden)
router.put('/cambiar-plan', verificarToken, cambiarPlan)

export default router
