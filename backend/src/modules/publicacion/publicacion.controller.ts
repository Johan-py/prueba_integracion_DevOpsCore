// backend/src/modules/publicacion/publicacion.controller.ts
import type { Response } from 'express'
import { eliminarPublicacionService, listarMisPublicacionesService } from './publicacion.service.ts'

// Extiende Request para incluir el usuario autenticado
import type { Request } from "express";

interface AuthRequest extends Request {
  usuario?: {
    id: number;
    nombre?: string;
    rol?: string;
  };
}

export const listarMisPublicacionesController = async (
  req: AuthRequest,
  res: Response,
) => {
  const usuarioId = req.usuario?.id;

  try {
    const publicaciones = await listarMisPublicacionesService(
      Number(usuarioId),
    );

    return res.status(200).json({
      ok: true,
      data: publicaciones,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "USUARIO_INVALIDO") {
      return res.status(401).json({
        ok: false,
        message: "Usuario no autenticado",
      });
    }

    console.error("Error al listar mis publicaciones:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudieron obtener las publicaciones",
    });
  }
};

export const eliminarPublicacionController = async (
  req: AuthRequest,
  res: Response,
) => {
  const publicacionId = Number(req.params.id);
  const usuarioSolicitanteId = req.usuario?.id;

  try {
    const resultado = await eliminarPublicacionService(
      publicacionId,
      Number(usuarioSolicitanteId),
    );

    return res.status(200).json({
      ok: true,
      message: "Publicación eliminada correctamente",
      data: resultado,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "ID_INVALIDO":
          return res
            .status(400)
            .json({
              ok: false,
              message: "El id de la publicación es inválido",
            });
        case "USUARIO_INVALIDO":
          return res
            .status(401)
            .json({ ok: false, message: "Usuario no autenticado" });
        case "PUBLICACION_NO_EXISTE":
          return res
            .status(404)
            .json({ ok: false, message: "La publicación no existe" });
        case "NO_AUTORIZADO":
          return res
            .status(403)
            .json({
              ok: false,
              message: "No puede eliminar publicaciones de otros usuarios",
            });
        case "PUBLICACION_YA_ELIMINADA":
          return res
            .status(409)
            .json({ ok: false, message: "La publicación ya fue eliminada" });
      }
    }

    console.error("Error al eliminar publicación:", error);

    return res.status(500).json({
      ok: false,
      message: "No se puede eliminar la publicación, intente nuevamente",
    });
  }
};
