import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  createAdminTestimonio,
  deleteAdminTestimonio,
  getAdminTestimonios,
  updateAdminTestimonio,
} from "./adminTestimonios.controller.js";

const router = Router();

router.get("/testimonios", requireAuth, getAdminTestimonios);
router.post("/testimonios", requireAuth, createAdminTestimonio);
router.put("/testimonios/:id", requireAuth, updateAdminTestimonio);
router.delete("/testimonios/:id", requireAuth, deleteAdminTestimonio);

export default router;
