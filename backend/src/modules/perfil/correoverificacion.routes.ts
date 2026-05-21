import { Router } from "express";
import {
  verificarPassword,
  cambiarPassword,
  solicitarCambioEmail,
  confirmarCambioEmail,
} from "./correoverificacion.controller.js";

// 🔥 tu nuevo middleware limpio
import { validarJWT } from "../../middleware/validarJWT.js";

const router = Router();

router.post('/verificar-password', validarJWT, verificarPassword)
router.post('/cambiar-password', validarJWT, cambiarPassword)
router.post('/solicitar-cambio-email', validarJWT, solicitarCambioEmail)
router.post('/confirmar-cambio-email', validarJWT, confirmarCambioEmail)

export default router;
