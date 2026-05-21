import type { Request, Response } from "express";
import {
  eliminarPublicacionService,
  listarMisPublicacionesService,
  editarPublicacionService,
  editarMultimediaPublicacionService,
  obtenerResumenFinalService,
  obtenerDetallePublicacionService,
  obtenerDetallePublicacionPorInmuebleService,
  confirmarPublicacionService,
  // ==================== NUEVAS IMPORTACIONES HU-11 ====================
  iniciarPublicidadService,
  confirmarPublicidadService,
  cancelarPublicidadService,
  obtenerEstadoPublicidadService,
} from "./publicacion.service.js";

interface AuthRequest extends Request {
  user?: {
    id: number;
    correo?: string;
    nombre?: string;
    rol?: string;
  };
}

export const listarMisPublicacionesController = async (
  req: AuthRequest,
  res: Response,
) => {
  const usuarioId = req.user?.id;

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

export const obtenerResumenFinalController = async (
  req: AuthRequest,
  res: Response,
) => {
  const publicacionId = Number(req.params.id);
  const usuarioSolicitanteId = req.user?.id;

  try {
    const resumen = await obtenerResumenFinalService(
      publicacionId,
      Number(usuarioSolicitanteId),
    );

    return res.status(200).json({
      ok: true,
      data: resumen,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "ID_INVALIDO":
          return res.status(400).json({
            ok: false,
            message: "El id de la publicación es inválido",
          });

        case "USUARIO_INVALIDO":
          return res.status(401).json({
            ok: false,
            message: "Usuario no autenticado",
          });

        case "PUBLICACION_NO_EXISTE":
          return res.status(404).json({
            ok: false,
            message: "La publicación no existe",
          });

        case "NO_AUTORIZADO":
          return res.status(403).json({
            ok: false,
            message:
              "No puede acceder al resumen final de una publicación de otro usuario",
          });

        case "PUBLICACION_YA_ELIMINADA":
          return res.status(409).json({
            ok: false,
            message: "La publicación ya fue eliminada",
          });
      }
    }

    console.error("Error al obtener resumen final de la publicación:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudo obtener el resumen final de la publicación",
    });
  }
};

export const editarPublicacionController = async (
  req: AuthRequest,
  res: Response,
) => {
  const publicacionId = Number(req.params.id);
  const usuarioSolicitanteId = req.user?.id;

  try {
    const resultado = await editarPublicacionService(
      publicacionId,
      Number(usuarioSolicitanteId),
      req.body,
    );

    return res.status(200).json({
      ok: true,
      message: "Publicación actualizada correctamente",
      data: resultado,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "ID_INVALIDO":
          return res.status(400).json({
            ok: false,
            message: "El id de la publicación es inválido",
          });

        case "USUARIO_INVALIDO":
          return res.status(401).json({
            ok: false,
            message: "Usuario no autenticado",
          });

        case "PUBLICACION_NO_EXISTE":
          return res.status(404).json({
            ok: false,
            message: "La publicación no existe",
          });

        case "NO_AUTORIZADO":
          return res.status(403).json({
            ok: false,
            message: "No puede editar publicaciones de otros usuarios",
          });

        case "PUBLICACION_YA_ELIMINADA":
          return res.status(409).json({
            ok: false,
            message: "La publicación ya fue eliminada",
          });

        case "TITULO_INVALIDO":
          return res.status(400).json({
            ok: false,
            message: "El título ingresado es inválido",
          });

        case "DESCRIPCION_INVALIDA":
          return res.status(400).json({
            ok: false,
            message: "La descripción ingresada es inválida",
          });

        case "TIPO_ACCION_INVALIDO":
          return res.status(400).json({
            ok: false,
            message: "El tipo de operación ingresado es inválido",
          });

        case "UBICACION_INVALIDA":
          return res.status(400).json({
            ok: false,
            message: "La ubicación ingresada es inválida",
          });

        case "PRECIO_INVALIDO":
          return res.status(400).json({
            ok: false,
            message: "El precio ingresado es inválido",
          });
      }
    }

    console.error("Error al editar publicación:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudo actualizar la publicación",
    });
  }
};

export const eliminarPublicacionController = async (
  req: AuthRequest,
  res: Response,
) => {
  const publicacionId = Number(req.params.id);
  const usuarioSolicitanteId = req.user?.id;

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
          return res.status(400).json({
            ok: false,
            message: "El id de la publicación es inválido",
          });

        case "USUARIO_INVALIDO":
          return res.status(401).json({
            ok: false,
            message: "Usuario no autenticado",
          });

        case "PUBLICACION_NO_EXISTE":
          return res.status(404).json({
            ok: false,
            message: "La publicación no existe",
          });

        case "NO_AUTORIZADO":
          return res.status(403).json({
            ok: false,
            message: "No puede eliminar publicaciones de otros usuarios",
          });

        case "PUBLICACION_YA_ELIMINADA":
          return res.status(409).json({
            ok: false,
            message: "La publicación ya fue eliminada",
          });
      }
    }

    console.error("Error al eliminar publicación:", error);

    return res.status(500).json({
      ok: false,
      message: "No se puede eliminar la publicación, intente nuevamente",
    });
  }
};

export const obtenerDetallePublicacionController = async (
  req: Request,
  res: Response,
) => {
  const publicacionId = Number(req.params.id);

  try {
    const detalle = await obtenerDetallePublicacionService(publicacionId);

    return res.status(200).json({
      ok: true,
      data: detalle,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "ID_INVALIDO":
          return res.status(400).json({
            ok: false,
            message: "El id de la publicación es inválido",
          });

        case "PUBLICACION_NO_EXISTE":
          return res.status(404).json({
            ok: false,
            message: "La publicación no existe",
          });
      }
    }

    console.error("Error al obtener detalle de publicación:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudo obtener el detalle de la publicación",
    });
  }
};

export const obtenerDetallePublicacionPorInmuebleController = async (
  req: Request,
  res: Response,
) => {
  const inmuebleId = Number(req.params.inmuebleId);

  try {
    const detalle =
      await obtenerDetallePublicacionPorInmuebleService(inmuebleId);

    return res.status(200).json({
      ok: true,
      data: detalle,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "ID_INVALIDO":
          return res.status(400).json({
            ok: false,
            message: "El id del inmueble es inválido",
          });

        case "PUBLICACION_NO_EXISTE":
          return res.status(404).json({
            ok: false,
            message: "No existe una publicación asociada a este inmueble",
          });
      }
    }

    console.error(
      "Error al obtener detalle de publicación por inmueble:",
      error,
    );

    return res.status(500).json({
      ok: false,
      message: "No se pudo obtener el detalle de la publicación por inmueble",
    });
  }
};

export const confirmarPublicacionController = async (
  req: AuthRequest,
  res: Response,
) => {
  const publicacionId = Number(req.params.id);
  const usuarioSolicitanteId = req.user?.id;

  try {
    const resultado = await confirmarPublicacionService(
      publicacionId,
      Number(usuarioSolicitanteId),
    );

    return res.status(200).json({
      ok: true,
      message: "Publicación confirmada correctamente",
      data: resultado,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "ID_INVALIDO":
          return res.status(400).json({
            ok: false,
            message: "El id de la publicación es inválido",
          });

        case "USUARIO_INVALIDO":
          return res.status(401).json({
            ok: false,
            message: "Usuario no autenticado",
          });

        case "PUBLICACION_NO_EXISTE":
          return res.status(404).json({
            ok: false,
            message: "La publicación no existe",
          });

        case "NO_AUTORIZADO":
          return res.status(403).json({
            ok: false,
            message: "No puede confirmar publicaciones de otros usuarios",
          });

        case "PUBLICACION_YA_ELIMINADA":
          return res.status(409).json({
            ok: false,
            message: "La publicación ya fue eliminada",
          });

        case "MULTIMEDIA_REQUERIDA":
          return res.status(400).json({
            ok: false,
            message:
              "Debe agregar al menos una imagen o video antes de publicar",
          });
      }
    }

    console.error("Error al confirmar publicación:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudo confirmar la publicación",
    });
  }
};

export const editarMultimediaPublicacionController = async (
  req: AuthRequest,
  res: Response,
) => {
  const publicacionId = Number(req.params.id);
  const usuarioSolicitanteId = req.user?.id;
  const archivos = (req.files as Express.Multer.File[]) ?? [];

  try {
    const resultado = await editarMultimediaPublicacionService(
      publicacionId,
      Number(usuarioSolicitanteId),
      req.body,
      archivos,
    );

    return res.status(200).json({
      ok: true,
      message: "Contenido multimedia actualizado correctamente",
      data: resultado,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "ID_INVALIDO":
          return res.status(400).json({
            ok: false,
            message: "El id de la publicación es inválido",
          });

        case "USUARIO_INVALIDO":
          return res.status(401).json({
            ok: false,
            message: "Usuario no autenticado",
          });

        case "PUBLICACION_NO_EXISTE":
          return res.status(404).json({
            ok: false,
            message: "La publicación no existe",
          });

        case "NO_AUTORIZADO":
          return res.status(403).json({
            ok: false,
            message:
              "No puede editar multimedia de publicaciones de otros usuarios",
          });

        case "PUBLICACION_YA_ELIMINADA":
          return res.status(409).json({
            ok: false,
            message: "La publicación ya fue eliminada",
          });

        case "VIDEO_INVALIDO":
          return res.status(400).json({
            ok: false,
            message:
              "Solo se permiten enlaces de YouTube o plataformas permitidas.",
          });

        case "MINIMO_UNA_IMAGEN":
          return res.status(400).json({
            ok: false,
            message: "La publicación debe tener al menos 1 imagen.",
          });

        case "LIMITE_IMAGENES":
          return res.status(400).json({
            ok: false,
            message: "Has alcanzado el límite máximo de 5 imágenes.",
          });

        case "FORMATO_IMAGEN_INVALIDO":
          return res.status(400).json({
            ok: false,
            message: "Formato no válido. Solo se permiten archivos JPG y PNG.",
          });

        case "LIMIT_FILE_SIZE":
          return res.status(400).json({
            ok: false,
            message:
              "El archivo supera el tamaño máximo permitido de 5MB por imagen.",
          });
      }
    }

    console.error("Error al editar multimedia de publicación:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudo actualizar el contenido multimedia",
    });
  }
};
// ==================== NUEVOS CONTROLADORES HU-11 ====================
// PUBLICIDAD DE PROPIEDADES

export const iniciarPublicidadController = async (
  req: AuthRequest,
  res: Response
) => {
  const publicacionId = Number(req.params.id);
  const usuarioId = req.user?.id;

  try {
    const resultado = await iniciarPublicidadService(
      publicacionId,
      Number(usuarioId)
    );

    return res.status(200).json({
      ok: true,
      message: "Solicitud de publicidad iniciada correctamente",
      data: resultado,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "ID_INVALIDO":
          return res.status(400).json({
            ok: false,
            message: "El id de la publicación es inválido",
          });
        case "USUARIO_INVALIDO":
          return res.status(401).json({
            ok: false,
            message: "Usuario no autenticado",
          });
        case "PUBLICACION_NO_EXISTE":
          return res.status(404).json({
            ok: false,
            message: "La publicación no existe",
          });
        case "NO_AUTORIZADO":
          return res.status(403).json({
            ok: false,
            message: "No puede promocionar publicaciones de otros usuarios",
          });
        case "PUBLICACION_YA_ELIMINADA":
          return res.status(409).json({
            ok: false,
            message: "La publicación ya fue eliminada",
          });
        case "PUBLICACION_YA_PUBLICITADA":
          return res.status(400).json({
            ok: false,
            message: "La publicación ya está promocionada",
          });
      }
    }

    console.error("Error al iniciar publicidad:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudo iniciar la solicitud de publicidad",
    });
  }
};

export const confirmarPublicidadController = async (
  req: AuthRequest,
  res: Response
) => {
  const publicacionId = Number(req.params.id);
  const usuarioId = req.user?.id;
  const { paymentIntentId, planId } = req.body;

  try {
    const resultado = await confirmarPublicidadService(
      publicacionId,
      Number(usuarioId),
      paymentIntentId,
      planId
    );

    return res.status(200).json({
      ok: true,
      message: "Publicidad activada correctamente",
      data: resultado,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "ID_INVALIDO":
          return res.status(400).json({
            ok: false,
            message: "El id de la publicación es inválido",
          });
        case "USUARIO_INVALIDO":
          return res.status(401).json({
            ok: false,
            message: "Usuario no autenticado",
          });
        case "PUBLICACION_NO_EXISTE":
          return res.status(404).json({
            ok: false,
            message: "La publicación no existe",
          });
        case "NO_AUTORIZADO":
          return res.status(403).json({
            ok: false,
            message: "No autorizado",
          });
        case "PAYMENT_INTENT_REQUERIDO":
          return res.status(400).json({
            ok: false,
            message: "ID de pago requerido",
          });
        default:
          return res.status(500).json({
            ok: false,
            message: "Error al activar publicidad",
          });
      }
    }

    console.error("Error al confirmar publicidad:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudo confirmar la promoción",
    });
  }
};

export const cancelarPublicidadController = async (
  req: AuthRequest,
  res: Response
) => {
  const publicacionId = Number(req.params.id);
  const usuarioId = req.user?.id;

  try {
    const resultado = await cancelarPublicidadService(
      publicacionId,
      Number(usuarioId)
    );

    return res.status(200).json({
      ok: true,
      message: "Promoción cancelada correctamente",
      data: resultado,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "ID_INVALIDO":
          return res.status(400).json({
            ok: false,
            message: "El id de la publicación es inválido",
          });
        case "USUARIO_INVALIDO":
          return res.status(401).json({
            ok: false,
            message: "Usuario no autenticado",
          });
        case "PUBLICACION_NO_EXISTE":
          return res.status(404).json({
            ok: false,
            message: "La publicación no existe",
          });
        case "NO_AUTORIZADO":
          return res.status(403).json({
            ok: false,
            message: "No puede cancelar promociones de otros usuarios",
          });
        case "PUBLICACION_NO_PUBLICITADA":
          return res.status(400).json({
            ok: false,
            message: "La publicación no está promocionada",
          });
      }
    }

    console.error("Error al cancelar publicidad:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudo cancelar la promoción",
    });
  }
};

export const obtenerEstadoPublicidadController = async (
  req: Request,
  res: Response
) => {
  const publicacionId = Number(req.params.id);

  try {
    const resultado = await obtenerEstadoPublicidadService(publicacionId);

    return res.status(200).json({
      ok: true,
      data: resultado,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "ID_INVALIDO":
          return res.status(400).json({
            ok: false,
            message: "El id de la publicación es inválido",
          });
        case "PUBLICACION_NO_EXISTE":
          return res.status(404).json({
            ok: false,
            message: "La publicación no existe",
          });
      }
    }

    console.error("Error al obtener estado de publicidad:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudo obtener el estado de la promoción",
    });
  }
};
