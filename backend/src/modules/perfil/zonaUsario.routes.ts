import { Router } from 'express'
import {
  getZonasUsuario,
  getZonaById,
  createZona,
  updateZona,
  deleteZona,
  getPropiedadesEnZona
} from './zonaUsuario.controller.js'
import { validarJWT } from '../../middleware/validarJWT.js'

const router = Router()

// 🔐 Todas protegidas
router.use(validarJWT)

// 📌 CRUD
router.get('/', getZonasUsuario)
router.get('/:id', getZonaById)
router.post('/', createZona)
router.put('/:id', updateZona)
router.delete('/:id', deleteZona)

// 📌 Endpoint adicional para HU-08
router.get('/:id/propiedades', getPropiedadesEnZona)

export default router
