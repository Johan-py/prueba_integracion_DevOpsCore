// routes/comparacionRoutes.ts
import { Router } from 'express'
import { comparacionController } from './comparacion.controller.js'
import { validarJWT } from '../../middleware/validarJWT.js'

const router = Router()

// Rutas que requieren autenticación obligatoria
router.use(validarJWT)

// ============================================
// RUTAS PRINCIPALES
// ============================================

/**
 * GET /
 * Obtiene todas las comparaciones del usuario autenticado
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @response 200 - OK
 * [
 *   {
 *     "id": 1,
 *     "nombre": "Comparación Departamentos Centro",
 *     "fecha": "2026-05-07T10:00:00.000Z",
 *     "propiedades": [
 *       {
 *         "id": 10,
 *         "titulo": "Moderno departamento en Sopocachi",
 *         "ubicacion": "Sopocachi",
 *         "precio": 120000,
 *         "superficie": 85,
 *         "categoria": "DEPARTAMENTO",
 *         "tipoAccion": "VENTA"
 *       }
 *     ]
 *   }
 * ]
 *
 * @response 401 - Unauthorized
 * {
 *   "message": "Token no proporcionado"
 * }
 *
 * @response 500 - Internal Server Error
 * {
 *   "error": "Error interno del servidor"
 * }
 */
router.get('/', comparacionController.getComparaciones)

/**
 * GET /resumen
 * Obtiene un resumen de las comparaciones agrupadas por categoría
 * Útil para el dashboard y estadísticas
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @response 200 - OK
 * {
 *   "historial": {
 *     "DEPARTAMENTO": [
 *       {
 *         "id": 1,
 *         "fecha": "2026-05-07T10:00:00.000Z",
 *         "propiedades": [
 *           {
 *             "ubicacion": "Sopocachi",
 *             "precio": 120000,
 *             "superficie": 85,
 *             "rangoPrecio": "120000",
 *             "rangoSuperficie": 85
 *           }
 *         ]
 *       }
 *     ],
 *     "CASA": [
 *       {
 *         "id": 2,
 *         "fecha": "2026-05-07T11:00:00.000Z",
 *         "propiedades": [
 *           {
 *             "ubicacion": "Zona Sur",
 *             "precio": 250000,
 *             "superficie": 200,
 *             "rangoPrecio": "250000",
 *             "rangoSuperficie": 200
 *           }
 *         ]
 *       }
 *     ]
 *   },
 *   "ultimaActualizacion": "2026-05-10T15:30:00.000Z"
 * }
 *
 * @response 401 - Unauthorized
 * {
 *   "message": "Token no proporcionado"
 * }
 *
 * @response 500 - Internal Server Error
 * {
 *   "error": "Error interno del servidor"
 * }
 */
router.get('/resumen', comparacionController.getResumenComparaciones)

/**
 * GET /:id
 * Obtiene una comparación específica por su ID
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @params
 * id - ID de la comparación (número)
 *
 * @response 200 - OK
 * {
 *   "id": 1,
 *   "nombre": "Comparación Departamentos Centro",
 *   "creadoEn": "2026-05-07T10:00:00.000Z",
 *   "usuarioId": 5,
 *   "detalle_comparacion": [
 *     {
 *       "id": 1,
 *       "orden": 0,
 *       "inmueble": {
 *         "id": 10,
 *         "titulo": "Moderno departamento en Sopocachi",
 *         "tipoAccion": "VENTA",
 *         "categoria": "DEPARTAMENTO",
 *         "precio": 120000,
 *         "superficieM2": 85,
 *         "nroCuartos": 3,
 *         "nroBanos": 2,
 *         "descripcion": "Excelente ubicación, cerca de todo",
 *         "ubicacion": {
 *           "zona": "Sopocachi",
 *           "ciudad": "La Paz",
 *           "direccion": "Calle 6, #123"
 *         }
 *       }
 *     }
 *   ]
 * }
 *
 * @response 401 - Unauthorized
 * {
 *   "message": "Token no proporcionado"
 * }
 *
 * @response 404 - Not Found
 * {
 *   "error": "Comparación no encontrada"
 * }
 *
 * @response 500 - Internal Server Error
 * {
 *   "error": "Error interno del servidor"
 * }
 */
router.get('/:id', comparacionController.getComparacionById)

/**
 * POST /
 * Crea una nueva comparación con las propiedades seleccionadas
 *
 * @headers
 * Authorization: Bearer <token>
 * Content-Type: application/json
 *
 * @body
 * {
 *   "nombre": "Comparación Departamentos Centro", // Opcional
 *   "inmueblesIds": [10, 15, 20] // Requerido, mínimo 2 IDs
 * }
 *
 * @response 201 - Created
 * {
 *   "id": 3,
 *   "nombre": "Comparación Departamentos Centro",
 *   "usuarioId": 5,
 *   "creadoEn": "2026-05-10T15:30:00.000Z",
 *   "detalle_comparacion": [
 *     {
 *       "id": 5,
 *       "comparacionId": 3,
 *       "inmuebleId": 10,
 *       "orden": 0,
 *       "inmueble": {
 *         "id": 10,
 *         "titulo": "Moderno departamento en Sopocachi",
 *         "precio": 120000
 *       }
 *     },
 *     {
 *       "id": 6,
 *       "comparacionId": 3,
 *       "inmuebleId": 15,
 *       "orden": 1,
 *       "inmueble": {
 *         "id": 15,
 *         "titulo": "Departamento en Achumani",
 *         "precio": 180000
 *       }
 *     }
 *   ]
 * }
 *
 * @response 400 - Bad Request
 * {
 *   "error": "Se necesitan al menos 2 propiedades para comparar"
 * }
 *
 * O
 *
 * {
 *   "error": "Una o más propiedades no existen"
 * }
 *
 * @response 401 - Unauthorized
 * {
 *   "message": "Token no proporcionado"
 * }
 *
 * @response 500 - Internal Server Error
 * {
 *   "error": "Error interno del servidor"
 * }
 */
router.post('/', comparacionController.crearComparacion)

/**
 * DELETE /:id
 * Elimina una comparación existente
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @params
 * id - ID de la comparación a eliminar (número)
 *
 * @response 200 - OK
 * {
 *   "message": "Comparación eliminada exitosamente"
 * }
 *
 * @response 401 - Unauthorized
 * {
 *   "message": "Token no proporcionado"
 * }
 *
 * @response 404 - Not Found
 * {
 *   "error": "Comparación no encontrada"
 * }
 *
 * @response 500 - Internal Server Error
 * {
 *   "error": "Error interno del servidor"
 * }
 */
router.delete('/:id', comparacionController.eliminarComparacion)

// ============================================
// RUTAS PARA MANEJAR PROPIEDADES
// ============================================

/**
 * POST /:id/propiedades
 * Agrega una nueva propiedad a una comparación existente
 *
 * @headers
 * Authorization: Bearer <token>
 * Content-Type: application/json
 *
 * @params
 * id - ID de la comparación (número)
 *
 * @body
 * {
 *   "inmuebleId": 25 // ID de la propiedad a agregar
 * }
 *
 * @response 200 - OK
 * {
 *   "id": 7,
 *   "comparacionId": 3,
 *   "inmuebleId": 25,
 *   "orden": 2,
 *   "inmueble": {
 *     "id": 25,
 *     "titulo": "Departamento en Obrajes",
 *     "precio": 150000,
 *     "superficieM2": 90,
 *     "categoria": "DEPARTAMENTO"
 *   }
 * }
 *
 * @response 400 - Bad Request
 * {
 *   "error": "La propiedad ya está en esta comparación"
 * }
 *
 * @response 401 - Unauthorized
 * {
 *   "message": "Token no proporcionado"
 * }
 *
 * @response 404 - Not Found
 * {
 *   "error": "Comparación no encontrada"
 * }
 *
 * @response 500 - Internal Server Error
 * {
 *   "error": "Error interno del servidor"
 * }
 */
router.post('/:id/propiedades', comparacionController.agregarPropiedad)

/**
 * DELETE /:id/propiedades/:propiedadId
 * Elimina una propiedad específica de una comparación
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @params
 * id - ID de la comparación (número)
 * propiedadId - ID de la propiedad a eliminar (número)
 *
 * @response 200 - OK
 * {
 *   "message": "Propiedad eliminada de la comparación"
 * }
 *
 * @response 401 - Unauthorized
 * {
 *   "message": "Token no proporcionado"
 * }
 *
 * @response 404 - Not Found
 * {
 *   "error": "Comparación no encontrada"
 * }
 *
 * @response 500 - Internal Server Error
 * {
 *   "error": "Error interno del servidor"
 * }
 */
router.delete('/:id/propiedades/:propiedadId', comparacionController.eliminarPropiedad)

// ============================================
// RUTAS DE FILTRADO
// ============================================

/**
 * GET /categoria/:categoria
 * Obtiene las comparaciones filtradas por categoría de propiedad
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @params
 * categoria - Categoría de la propiedad (CASA, DEPARTAMENTO, TERRENO, OFICINA, CUARTO)
 *
 * @response 200 - OK
 * [
 *   {
 *     "id": 1,
 *     "nombre": "Comparación Departamentos Centro",
 *     "creadoEn": "2026-05-07T10:00:00.000Z",
 *     "usuarioId": 5,
 *     "detalle_comparacion": [
 *       {
 *         "id": 1,
 *         "orden": 0,
 *         "inmueble": {
 *           "id": 10,
 *           "categoria": "DEPARTAMENTO",
 *           "ubicacion": {
 *             "zona": "Sopocachi"
 *           }
 *         }
 *       }
 *     ]
 *   }
 * ]
 *
 * @response 401 - Unauthorized
 * {
 *   "message": "Token no proporcionado"
 * }
 *
 * @response 500 - Internal Server Error
 * {
 *   "error": "Error interno del servidor"
 * }
 *
 * @example
 * GET /api/comparaciones/categoria/DEPARTAMENTO
 * GET /api/comparaciones/categoria/CASA
 * GET /api/comparaciones/categoria/TERRENO
 */
router.get('/categoria/:categoria', comparacionController.getComparacionesPorCategoria)

export default router
