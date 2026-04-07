import { Router } from 'express'
import { createProperty, cancelProperty } from '../registro-publicacion/publicacion.controller'
import { propertyValidationRules } from '../registro-publicacion/publicacion.validator'
//import { verifyToken } from '../middleware/auth.middleware'

const router = Router()

router.post('/properties', propertyValidationRules, createProperty)
router.post('/properties/cancel', cancelProperty)

export default router
