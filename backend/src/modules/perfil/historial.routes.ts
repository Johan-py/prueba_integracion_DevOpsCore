import { Router } from 'express'
import { historialController } from './historial.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'

const router = Router()

// Endpoint: GET /api/perfil/historial/vistas
router.get('/vistas', requireAuth, historialController.getHistorialVistas)

// Endpoint: PATCH /api/perfil/historial/limpiar
router.patch('/limpiar', requireAuth, historialController.deleteHistorial)

export default router
