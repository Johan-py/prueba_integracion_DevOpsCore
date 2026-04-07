import { Router } from "express";
import {
  generarPagoQr,
  obtenerPagoPendiente,
  actualizarEstadoPago,
  consultarEstadoPago,
} from "../controllers/transacciones.controller.js";

const router = Router();

router.post("/generar-qr", generarPagoQr);
router.get("/pendiente/:usuarioId", obtenerPagoPendiente);
router.patch("/:id/estado", actualizarEstadoPago);
router.get("/:id/estado", consultarEstadoPago);

export default router;
