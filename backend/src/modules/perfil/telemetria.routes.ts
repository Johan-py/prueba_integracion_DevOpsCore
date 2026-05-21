// modules/telemetria/telemetria.routes.ts
import { Router } from "express";
import { validarJWT } from "../../middleware/validarJWT.js";
import { telemetriaController } from "./telemetria.controller.js";

const router = Router();

// ============ RUTAS PÚBLICAS (sin autenticación) ============
// Para visitantes NO logueados - género inclusivo
/*
    Telemetría para VISITANTE (no logueado)
      POST http://localhost:3000/api/telemetria/visitante
      Content-Type: application/json

{
  "genero": "OTRO",
  "rango_edad": "26-35",
  "zona_interes": "Zona Norte"
}
*/
router.post("/visitante", telemetriaController.telemetriaVisitante);

// ============ RUTAS PROTEGIDAS (requieren JWT) ============
router.use(validarJWT);

// Endpoint cuando el usuario logueado ACEPTA la telemetría
/*
# Aceptar telemetría (usuario logueado)
POST http://localhost:3000/api/telemetria/aceptar
Authorization: Bearer TU_TOKEN_JWT_AQUI
Content-Type: application/json

{
  "genero": "MASCULINO",
  "fecha_nacimiento": "1990-05-15"
}
*/
router.post("/aceptar", telemetriaController.aceptarTelemetria);
/*
 GET http://localhost:3000/api/telemetria/estado
Authorization: Bearer TU_TOKEN_JWT_AQUI
*/
// Obtener estado actual de telemetría del usuario
router.get("/estado", telemetriaController.obtenerEstadoTelemetria);

// 📊 Estadísticas para equipo de filtros (solo admin)
/*
GET http://localhost:3000/api/telemetria/estadisticas/filtros
Authorization: Bearer TOKEN_DE_ADMIN_AQUI
*/
router.get("/estadisticas/filtros", telemetriaController.getEstadisticasFiltros);

export default router;