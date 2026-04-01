import { Request, Response } from "express";
import { publicacionesService } from "./publicaciones.service.js";

export type AuthenticatedRequest = Request & {
  user?: { id: number; email?: string };
};

export const listarPublicaciones = async (_req: Request, res: Response) => {
  const publicaciones = await publicacionesService.listarTodas();
  res.json(publicaciones);
};

export const listarPublicacionesGratis = async (_req: Request, res: Response) => {
  const publicaciones = await publicacionesService.listarGratis();
  res.json(publicaciones);
};

export const crearPublicacion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado." });
    }
    const nueva = await publicacionesService.crear(req.user.id, req.body);
    res.status(201).json(nueva);
  } catch (error: unknown) {
  if (error instanceof Error) {
    res.status(403).json({ message: error.message });
  }
}
};

export const flujoPublicacion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado. Redirigir a login." });
    }
    const mensaje = await publicacionesService.validarFlujo(req.user.id);
    res.status(200).json({ message: mensaje });
  } catch (error: unknown) {
  if (error instanceof Error) {
    res.status(403).json({ message: error.message });
  }
}
};
