import { Router } from 'express'
import { entrenarModelo } from './ml.controller.js'
import { validarJWT } from '../../middleware/validarJWT.js'
import { validarAdmin } from '../../middleware/validarAdmin.js'

const router = Router()

router.post('/entrenar', validarJWT, validarAdmin, entrenarModelo)

export default router