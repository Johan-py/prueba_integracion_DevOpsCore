import { Router } from 'express'
import { validarJWT } from '../../middleware/validarJWT.js'
import { validarAdmin } from '../../middleware/validarAdmin.js'
import { listarPlanes, crearPlan, actualizarPlan, eliminarPlan } from './adminPlanes.controller.js'

const router = Router()

router.get('/planes', validarJWT, validarAdmin, listarPlanes)
router.post('/planes', validarJWT, validarAdmin, crearPlan)
router.put('/planes/:id', validarJWT, validarAdmin, actualizarPlan)
router.delete('/planes/:id', validarJWT, validarAdmin, eliminarPlan)

export default router
