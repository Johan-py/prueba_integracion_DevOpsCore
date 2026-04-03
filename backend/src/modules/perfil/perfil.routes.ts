import { Router } from "express";
import {
  obtenerPerfil,
  editarNombre,
  editarPais,
  editarGenero,
  editarDireccion,
  editarFotoPerfil,
  editarTelefonos
} from "./perfil.controller.js";
import { validarJWT } from "../../middleware/validarJWT.js";

const router = Router();

// GET - Obtener perfil --> GET http://localhost:5000/api/perfil
router.get("/", validarJWT, obtenerPerfil);

// PUTs - Editar cada campo

/*
PUT http://localhost:5000/api/perfil/usuario/nombre
{
  "nombre": "Carlos"
}
*/
router.put("/nombre", validarJWT, editarNombre);
/*
PUT http://localhost:5000/api/perfil/usuario/pais
{
  "pais": "Bolivia"
}
*/
router.put("/pais", validarJWT, editarPais);
/*
PUT http://localhost:5000/api/perfil/usuario/genero
{
  "genero": "Masculino" "Femenino" 
}
*/
router.put("/genero", validarJWT, editarGenero);
/*
PUT http://localhost:5000/api/perfil/usuario/direccion
{
  "direccion": "Calle Principal 123"
}
*/
router.put("/direccion", validarJWT, editarDireccion);
/*
PUT http://localhost:5000/api/perfil/usuario/foto-perfil
{
  "fotoPerfil": "https://example.com/nueva-foto.jpg"
}
*/
router.put("/foto-perfil", validarJWT, editarFotoPerfil);
/*
PUT http://localhost:5000/api/perfil/usuario/telefonos
{
  "telefonos": ["+59171234567", "+59176543210"]}
*/

router.put("/telefonos", validarJWT, editarTelefonos);

export default router;