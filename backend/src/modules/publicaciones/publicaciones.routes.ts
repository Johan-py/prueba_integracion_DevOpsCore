import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";   
import {
  listarPublicaciones,
  listarPublicacionesGratis,
  crearPublicacion,
  flujoPublicacion,
} from "./publicaciones.controller.js";

const router = Router();

router.get("/publicaciones", listarPublicaciones);
router.get("/publicaciones/gratis", listarPublicacionesGratis);
router.post("/publicaciones", authMiddleware, crearPublicacion);
router.get("/publicaciones/flujo", authMiddleware, flujoPublicacion);

export default router;
