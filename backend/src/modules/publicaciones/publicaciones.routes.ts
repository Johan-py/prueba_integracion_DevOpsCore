import { Router } from "express"
import { requireAuth } from "../../middleware/auth.middleware.js"
import {
  listarPublicaciones,
  listarPublicacionesGratis,
  crearPublicacion,
  flujoPublicacion,
} from "./publicaciones.controller.js"

const router = Router()

router.get("/publicaciones", listarPublicaciones)
router.get("/publicaciones/gratis", listarPublicacionesGratis)
router.post("/publicaciones", requireAuth, crearPublicacion)
router.get("/publicaciones/flujo", requireAuth, flujoPublicacion)

export default router
