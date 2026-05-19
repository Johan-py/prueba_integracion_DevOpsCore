import type { Request, Response } from "express";
import { validationResult } from "express-validator";
import { tagsService } from "./tags.service.js";

export const getTagsController = async (_req: Request, res: Response) => {
  try {
    const data = await tagsService.getAll();
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    console.error("Error al listar tags:", error);
    return res.status(500).json({
      ok: false,
      message: "INTERNAL_SERVER_ERROR",
      mensaje: "Error al listar tags",
    });
  }
};

export const getTagsByPublicacionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const publicacionId = Number(req.params.publicacionId);
    const data = await tagsService.getTagsByPublicacion(publicacionId);
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    console.error("Error al listar tags de la publicación:", error);
    return res.status(500).json({
      ok: false,
      message: "INTERNAL_SERVER_ERROR",
      mensaje: "Error al listar tags de la publicación",
    });
  }
};

export const replacePublicacionTagsController = async (
  req: Request,
  res: Response,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errores: errors.array().map((e) => ({
        campo: "path" in e ? e.path : "general",
        mensaje: e.msg,
      })),
    });
  }

  if (!req.user?.id) {
    return res.status(401).json({
      ok: false,
      message: "NOT_AUTHENTICATED",
      mensaje: "Usuario no autenticado",
    });
  }

  try {
    const publicacionId = Number(req.params.publicacionId);
    const { tags } = req.body;

    const data = await tagsService.replacePublicacionTags(
      publicacionId,
      req.user.id,
      tags ?? [],
    );

    return res.status(200).json({
      ok: true,
      mensaje: "Tags actualizados correctamente",
      data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PUBLICATION_NOT_FOUND") {
      return res.status(404).json({
        ok: false,
        message: "PUBLICATION_NOT_FOUND",
        mensaje: "La publicación no existe",
      });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return res.status(403).json({
        ok: false,
        message: "FORBIDDEN",
        mensaje: "No tienes permiso para modificar esta publicación",
      });
    }
    if (error instanceof Error && error.message === "MAX_TAGS_EXCEEDED") {
      return res.status(400).json({
        ok: false,
        message: "MAX_TAGS_EXCEEDED",
        mensaje: "No puedes agregar más de 15 tags",
      });
    }

    console.error("Error al actualizar tags:", error);
    return res.status(500).json({
      ok: false,
      message: "INTERNAL_SERVER_ERROR",
      mensaje: "Error al actualizar tags",
    });
  }
};
