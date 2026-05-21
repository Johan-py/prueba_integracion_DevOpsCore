import { Router } from "express";
import {
  obtenerPerfil,
  editarNombre,
  editarPais,
  editarGenero,
  editarDireccion,
  editarFotoPerfil,
  editarTelefonos,
  listarMisPublicaciones,
  obtenerPreferenciasNotificacion,
  actualizarPreferenciasNotificacion,
  editarFechaNacimiento,  // 👈 Agregar esta importación
  obtenerFechaNacimiento,   // 👈 Agregar esta importación
  eliminarPublicacion,        // 👈 Agregar
  togglePublicacionEstado     // 👈 Agregar
} from "./perfil.controller.js";
import { validarJWT } from "../../middleware/validarJWT.js";
import { upload } from "../../middleware/upload.js";

const router = Router();

// GET - Obtener perfil
router.get("/", validarJWT, obtenerPerfil);
router.get('/preferencias-notificacion', validarJWT, obtenerPreferenciasNotificacion);

// GET - Listar mis publicaciones
router.get("/mis-publicaciones", validarJWT, listarMisPublicaciones);

// GET - Obtener fecha de nacimiento
router.get("/fecha-nacimiento", validarJWT, obtenerFechaNacimiento);  // 👈 Agregar esta ruta

// PUTs - Editar cada campo
router.put("/nombre", validarJWT, editarNombre);
router.put("/pais", validarJWT, editarPais);
router.put("/genero", validarJWT, editarGenero);
router.put("/direccion", validarJWT, editarDireccion);
router.put("/foto-perfil", validarJWT, upload.single("foto"), editarFotoPerfil);
router.put("/telefonos", validarJWT, editarTelefonos);
router.put('/preferencias-notificacion', validarJWT, actualizarPreferenciasNotificacion);
router.put("/fecha-nacimiento", validarJWT, editarFechaNacimiento);  // 👈 Agregar esta ruta
router.delete("/publicaciones/:id", validarJWT, eliminarPublicacion);
router.patch("/publicaciones/:id/estado", validarJWT, togglePublicacionEstado);
export default router;
