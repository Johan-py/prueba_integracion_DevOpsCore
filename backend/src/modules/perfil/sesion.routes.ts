// backend/src/modules/sesion/sesion.routes.ts
import { Router } from 'express'
import { sesionController } from './sesion.controller.js'
import { validarJWT } from '../../middleware/validarJWT.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(validarJWT)

/**
 * @route GET /
 * @description Obtener todas las sesiones del usuario autenticado
 * @access Requiere autenticación
 *
 * @response 200 - OK
 * {
 *   "total": 3,
 *   "activas": 2,
 *   "sesiones": [
 *     {
 *       "id": 1,
 *       "token": "eyJhbGciOiJIUzI1NiIs...",
 *       "fechaInicio": "2026-05-12T10:00:00.000Z",
 *       "fechaExpiracion": "2026-05-13T10:00:00.000Z",
 *       "estado": true,
 *       "metodoAuth": "email",
 *       "esActual": true
 *     }
 *   ]
 * }
 */
router.get('/', sesionController.getMisSesiones)

/**
 * @route GET /:id
 * @description Obtener una sesión específica por ID
 * @access Requiere autenticación
 *
 * @params id - ID de la sesión
 */
router.get('/:id', sesionController.getSesionById)

/**
 * @route DELETE /:id
 * @description Cerrar una sesión específica (cambiar estado a false)
 * @access Requiere autenticación
 *
 * @params id - ID de la sesión a cerrar
 *
 * @response 200 - OK
 * {
 *   "message": "Sesión cerrada exitosamente",
 *   "sesionId": 1
 * }
 */
router.delete('/:id', sesionController.cerrarSesion)

/**
 * @route DELETE /cerrar/todas
 * @description Cerrar todas las sesiones excepto la actual
 * @access Requiere autenticación
 *
 * @response 200 - OK
 * {
 *   "message": "Todas las demás sesiones fueron cerradas",
 *   "sesionesCerradas": 2
 * }
 */
router.delete('/cerrar/todas', sesionController.cerrarTodasSesionesExceptoActual)

export default router
