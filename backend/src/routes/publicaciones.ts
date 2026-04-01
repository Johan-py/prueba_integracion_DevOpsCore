import { Router } from 'express'
import {
  crearPublicacion,
  listarPublicaciones,
  validarPublicacionesFree
} from '../controllers/publicacionesController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

// Crear publicación
router.post('/publicaciones', authMiddleware, crearPublicacion)

// Listar publicaciones
router.get('/publicaciones', listarPublicaciones)

// Validar publicaciones gratuitas
router.get('/users/:id/publicaciones/free', authMiddleware, validarPublicacionesFree)

export default router
