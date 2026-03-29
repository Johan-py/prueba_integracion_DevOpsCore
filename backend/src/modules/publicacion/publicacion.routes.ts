import { Router } from 'express'
import {
  eliminarPublicacionController,
  listarMisPublicacionesController
} from './publicacion.controller.js'

const router = Router()

router.get('/mias', listarMisPublicacionesController)
router.delete('/:id', eliminarPublicacionController)

export default router
