import { Router } from 'express'
import { createProperty, cancelProperty } from '../registro-publicacion/publicacion.controller.js'
import { propertyValidationRules } from '../registro-publicacion/publicacion.validator.js'
//import { verifyToken } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/properties', propertyValidationRules, createProperty)
router.post('/properties/cancel', cancelProperty)

export default router
