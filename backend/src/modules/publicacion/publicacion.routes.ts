import { Router } from 'express'
import { eliminarPublicacionController } from './publicacion.controller.js'

const router = Router()

router.delete('/:id', eliminarPublicacionController)

export default router
