import { Router } from 'express'
import multer from 'multer'
import {
  generarPagoQr,
  obtenerPagoPendiente,
  consultarEstadoPago,
  cancelarTransaccion,
  confirmarPago,
  rechazarPago,
  aplicarCupon,
  actualizarTransaccion,
  listarTransaccionesAdmin,
  listarMisTransacciones,
  notificarAdmin,
  subirComprobante,
} from './transacciones.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'

const router = Router()

const uploadComprobante = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

router.get('/admin', requireAuth, listarTransaccionesAdmin)
router.get('/mis-transacciones', requireAuth, listarMisTransacciones)
router.post('/', requireAuth, generarPagoQr)
router.get('/pendiente/:userId', obtenerPagoPendiente)
router.patch('/:id/confirmar', requireAuth, confirmarPago)
router.patch('/:id/rechazar', requireAuth, rechazarPago)
router.post('/:id/notificar-admin', requireAuth, notificarAdmin)
router.post('/:id/comprobante', requireAuth, uploadComprobante.single('comprobante'), subirComprobante)
router.patch('/:id/cancelar', cancelarTransaccion)
router.patch('/:id/actualizar', actualizarTransaccion)
router.post('/:id/cupon', aplicarCupon)
router.get('/:id/estado', consultarEstadoPago)

export default router
