import { Router } from 'express';
import { getHistorialVistas } from "../controllers/propiedad.controller.js";
import { compare } from "../modules/properties/properties.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateCompareRequest } from "../modules/properties/properties.validator.js";
import { validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// Middleware genérico para capturar errores de express-validator
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }
  next();
};

// Aplicamos requireAuth: solo usuarios logueados verán su historial
router.get('/vistas-recientes', requireAuth, getHistorialVistas);

// Ruta para comparar propiedades (Pública), con validación DTO inyectada
router.post('/comparar', validateCompareRequest, validate, compare);

export default router;