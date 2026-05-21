import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'

import {
  getParametrosPersonalizados,
  createParametroPersonalizado,
  getPublicationParameters,
  replacePublicationParameters
} from './parametros.controller.js'

import {
  createParametroPersonalizadoRules,
  replacePublicationParametersRules
} from './parametros.validator.js'

const router = Router()
// Obtener todos los parámetros (para "Añadir otros parámetros")
router.get('/parametros', getParametrosPersonalizados)

// Crear nuevo parámetro personalizado
router.post(
  '/parametros',
  requireAuth,
  createParametroPersonalizadoRules,
  createParametroPersonalizado
)

// Obtener parámetros de una publicación
router.get('/publicaciones/:publicacionId/parametros', getPublicationParameters)

// Reemplazar / actualizar parámetros de una publicación
router.put(
  '/publicaciones/:publicacionId/parametros',
  requireAuth,
  replacePublicationParametersRules,
  replacePublicationParameters
)

export default router
