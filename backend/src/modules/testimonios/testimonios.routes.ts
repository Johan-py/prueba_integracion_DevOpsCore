import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  listarTestimonios,
  toggleLikeTestimonio,
} from "./testimonios.controller.js";

const router = Router();

// Público — cualquiera puede ver los testimonios
router.get("/", listarTestimonios);

// Autenticado — solo usuarios con sesión pueden dar like
router.post("/:id/like", requireAuth, toggleLikeTestimonio);

export default router;