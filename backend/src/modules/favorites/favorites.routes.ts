import { Router } from 'express'
import { FavoritesController } from './favorites.controller.js'
import { validarJWT } from '../../middleware/validarJWT.js'  // ← Cambiar a validarJWT

const router = Router()

// Usar validarJWT en lugar de authMiddleware
router.get('/', validarJWT, FavoritesController.getAll)
router.post('/', validarJWT, FavoritesController.add)
router.delete('/:inmuebleId', validarJWT, FavoritesController.remove)
router.get('/status/:inmuebleId', validarJWT, FavoritesController.status)

export default router