// backend/src/modules/publicaciones/publicacion.routes.ts
import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import {
  listarMisPublicacionesController,
  eliminarPublicacionController
} from './publicacion.controller.js'

const router = Router()

/**
 * HU1 - Listar publicaciones propias
 * - Requiere autenticación
 * - Devuelve publicaciones activas del usuario autenticado
 */
router.get('/mias', requireAuth, listarMisPublicacionesController)

/**
 * HU1 - Eliminar publicación propia
 * - Requiere autenticación
 * - Solo permite eliminar publicaciones del usuario autenticado
 * - Elimina de forma lógica (estado = ELIMINADA)
 */
router.delete('/:id', requireAuth, eliminarPublicacionController)

export default router
