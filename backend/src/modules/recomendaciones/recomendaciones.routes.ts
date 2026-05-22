import { Router } from 'express'
import {
  getRecomendacionesGlobales,
  getInmueblesRecomendados,
  ordenarPorAfinidad,
  invalidarCacheUsuario
} from './recomendaciones.controller.js'
import { validarJWT, validarJWTOpcional } from '../../middleware/validarJWT.js'

const router = Router()

router.get('/globales', validarJWTOpcional, getRecomendacionesGlobales)
router.get('/inmuebles', validarJWTOpcional, getInmueblesRecomendados)
router.post('/ordenar', validarJWT, ordenarPorAfinidad)
router.post('/invalidar-cache', validarJWT, invalidarCacheUsuario)

export default router
