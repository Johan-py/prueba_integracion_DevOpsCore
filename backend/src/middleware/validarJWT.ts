import type { Request, Response, NextFunction } from "express";
import { verifyJwtToken } from "../utils/jwt.js";
import { findActiveSessionByToken } from "../modules/auth/auth.repository.js";

// Extender Request
export interface AuthRequest extends Request {
  usuario?: any;
}

export const validarJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ No hay token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token no proporcionado",
      });
    }

    // ✅ Extraer token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token no proporcionado",
      });
    }

    // ✅ Verificar JWT
    verifyJwtToken(token);

    // ✅ Verificar sesión en BD
    const session = await findActiveSessionByToken(token);

    if (!session) {
      return res.status(401).json({
        message: "Sesión inválida o expirada",
      });
    }

    // ✅ Inyectar usuario
    req.usuario = session.usuario;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido",
    });
  }
};
export const validarJWTOpcional = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // Pasa sin usuario
    }
    const token = authHeader.split(" ")[1];
    if (!token) return next();

    const decoded = verifyJwtToken(token) as any;
    const session = await findActiveSessionByToken(token);
    
    if (session) {
      req.usuario = session.usuario;
    }
    next();
  } catch (error) {
    next(); // Si falla el token (ej. expirado), simplemente lo tratamos como "no logueado"
  }
};
