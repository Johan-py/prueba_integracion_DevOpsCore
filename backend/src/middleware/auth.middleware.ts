import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email?: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No autorizado: falta token." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No autorizado: token inválido." });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET no configurado en .env");
    }

    const decoded = jwt.verify(token, secret) as { id: number; email?: string };
    req.user = { id: decoded.id, email: decoded.email };

    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido o expirado." });
  }
};
