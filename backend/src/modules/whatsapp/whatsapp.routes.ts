import { Router } from "express";
import { obtenerEstado, obtenerQR, crearInstancia } from "./whatsapp.controller.js";
import { validarJWT } from "../../middleware/validarJWT.js";

const router = Router();

// Estas rutas idealmente deberían tener middleware de admin,
// por ahora usamos validarJWT
router.get("/estado", validarJWT, obtenerEstado);
router.get("/qr", validarJWT, obtenerQR);
router.post("/crear-instancia", validarJWT, crearInstancia);

export default router;