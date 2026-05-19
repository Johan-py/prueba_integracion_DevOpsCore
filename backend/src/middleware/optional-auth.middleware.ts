// se creo este optional para manejar las vistas de mis porpiedades con user no logueados
import type { NextFunction, Request, Response } from "express";

import { verifyJwtToken } from "../utils/jwt.js";
import { findActiveSessionByToken } from "../modules/auth/auth.repository.js";

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    verifyJwtToken(token);

    const session = await findActiveSessionByToken(token);

    if (!session) {
      return next();
    }

    req.user = {
      id: session.usuario.id,
      correo: session.usuario.correo,
    };

    return next();
  } catch {
    return next();
  }
};
