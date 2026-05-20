import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { uploadMultimedia } from "../../middleware/uploadMultimedia.middleware.js";
import {
  listarMisPublicacionesController,
  obtenerResumenFinalController,
  editarPublicacionController,
  editarMultimediaPublicacionController,
  eliminarPublicacionController,
  obtenerDetallePublicacionController,
  obtenerDetallePublicacionPorInmuebleController,
  confirmarPublicacionController,
  // ==================== NUEVAS IMPORTACIONES HU-11 ====================
  iniciarPublicidadController,
  confirmarPublicidadController,
  cancelarPublicidadController,
  obtenerEstadoPublicidadController,
} from "./publicacion.controller.js";

const router = Router();

router.get("/mias", requireAuth, listarMisPublicacionesController);
router.get("/:id/resumen-final", requireAuth, obtenerResumenFinalController);
router.get(
  "/inmueble/:inmuebleId/detalle",
  obtenerDetallePublicacionPorInmuebleController,
);
router.get("/:id/detalle", obtenerDetallePublicacionController);
router.patch("/:id/confirmar", requireAuth, confirmarPublicacionController);

router.put(
  "/:id/multimedia",
  requireAuth,
  uploadMultimedia.array("imagenesNuevas", 5),
  editarMultimediaPublicacionController,
);

router.put("/:id", requireAuth, editarPublicacionController);
router.delete("/:id", requireAuth, eliminarPublicacionController);


// ==================== NUEVAS RUTAS HU-11 ====================
// PUBLICIDAD DE PROPIEDADES

// Iniciar proceso de publicidad (retorna checkout URL)
router.post("/:id/publicitar", requireAuth, iniciarPublicidadController);

// Confirmar pago y activar publicidad
router.post(
  "/:id/publicitar/confirmar",
  requireAuth,
  confirmarPublicidadController
);

// Cancelar publicidad activa
router.delete(
  "/:id/publicitar/cancelar",
  requireAuth,
  cancelarPublicidadController
);

// Obtener estado de publicidad de una publicación
router.get("/:id/publicitar/estado", obtenerEstadoPublicidadController);

export default router;
