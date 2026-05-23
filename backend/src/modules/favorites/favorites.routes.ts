import { Router } from 'express'
import { FavoritesController } from './favorites.controller.js'
import { validarJWT } from '../../middleware/validarJWT.js'  // ← Cambiar a validarJWT

const router = Router()

// Usar validarJWT en lugar de authMiddleware
router.get('/', validarJWT, FavoritesController.getAll)
router.post('/', validarJWT, FavoritesController.add)
router.delete('/:inmueble_id', validarJWT, FavoritesController.remove)
router.get('/status/:inmueble_id', validarJWT, FavoritesController.status)

export default router
