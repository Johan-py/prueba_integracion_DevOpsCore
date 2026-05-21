import { Router } from 'express'
import { EstadisticasZonaController } from './estadisticas-zona.controller.js'

const router = Router()

// GET /api/estadisticas-zona/zonas  → Lista de zonas disponibles
router.get('/zonas', EstadisticasZonaController.getZonas)

// GET /api/estadisticas-zona?zonaId=1&tipoOperacion=VENTA
router.get('/', EstadisticasZonaController.getEstadisticas)

export default router
