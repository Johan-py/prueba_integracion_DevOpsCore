import { Router } from "express";
import {
  crearPublicacion,
  listarPublicaciones,
  validarPublicacionesFree,
} from "../controllers/publicacionesController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  reglasValidacionHU5,
  manejarErroresPublicacion,
  validarEtapaFinal,
  validarCancelacion,
} from "../middleware/erroresPublicacion.js";

const router = Router();

// HU‑1 + HU‑5 v2: Crear publicación con validación previa y bugs corregidos
router.post(
  "/publicaciones",
  authMiddleware,
  reglasValidacionHU5,        // validaciones HU‑5 v2
  manejarErroresPublicacion,  // agrupación de errores HU‑5 v2
  validarEtapaFinal,          // BUG‑E01/E05: etapa final
  validarCancelacion,         // BUG‑E03/E04: cancelación explícita
  crearPublicacion            // flujo HU‑1 con progreso real (BUG‑E02)
);

// HU‑1: Listar publicaciones
router.get("/publicaciones", listarPublicaciones);

// HU‑1: Validar publicaciones gratuitas (consulta simple)
router.get(
  "/users/:id/publicaciones/free",
  authMiddleware,
  validarPublicacionesFree,
);

export default router;
