import { Router } from 'express'
import { trackSearch, trackClick, getRecomendados } from './telemetria.controller.js'
import { validarJWT, validarJWTOpcional } from '../../middleware/validarJWT.js'

const router = Router()

router.post('/search', trackSearch)
router.post('/click', validarJWT, trackClick)
router.get('/recomendados', validarJWTOpcional, getRecomendados)

export default router
