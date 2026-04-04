import { Router } from 'express'
import { validarJWT } from '../../middleware/validarJWT.js'
import {
  eliminarPublicacionController,
  listarMisPublicacionesController
} from './publicacion.controller.js'

const router = Router()

router.get('/mias', validarJWT, listarMisPublicacionesController)
router.delete('/:id', validarJWT, eliminarPublicacionController)

export default router
