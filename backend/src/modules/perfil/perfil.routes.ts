import { Router } from 'express'
import {
  obtenerPerfil,
  editarNombre,
  editarPais,
  editarGenero,
  editarDireccion,
  editarFotoPerfil,
  editarTelefonos
} from './perfil.controller.js'
import { validarJWT } from '../../middleware/validarJWT.js'
import { upload } from '../../middleware/upload.js'

const router = Router()

// GET - Obtener perfil
router.get('/', validarJWT, obtenerPerfil)

// PUTs - Editar cada campo
router.put('/nombre', validarJWT, editarNombre)
router.put('/pais', validarJWT, editarPais)
router.put('/genero', validarJWT, editarGenero)
router.put('/direccion', validarJWT, editarDireccion)
router.put('/foto-perfil', validarJWT, upload.single('foto'), editarFotoPerfil)
router.put('/telefonos', validarJWT, editarTelefonos)

export default router
