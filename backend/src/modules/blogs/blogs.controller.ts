import { Request, Response } from "express";
import { blogsService, comentariosService } from "./blogs.service.js";
import { estado_blog } from "@prisma/client";
import { verifyJwtToken } from "../../utils/jwt.js";
import { findActiveSessionByToken } from "../auth/auth.repository.js";

// Tipo extendido con usuario autenticado
export type AuthRequest = Request & {
  user?: { id: number; correo?: string };
};

/** POST /api/blogs */
export const crearBlog = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "NOT_AUTHENTICATED" });

    const { titulo, contenido, imagen, categoria_id, accion } = req.body;
    const cleanTitulo = typeof titulo === "string" ? titulo.trim() : "";
    const cleanContenido =
      typeof contenido === "string" ? contenido.trim() : "";
    const cleanImagen = typeof imagen === "string" ? imagen.trim() : "";

    if (!cleanTitulo || !cleanContenido || !cleanImagen || !categoria_id) {
      return res.status(400).json({
        message: "titulo, contenido, imagen y categoria_id son requeridos",
      });
    }

    if (!["borrador", "pendiente"].includes(accion)) {
      return res
        .status(400)
        .json({ message: "accion debe ser 'borrador' o 'pendiente'" });
    }

    const blog = await blogsService.crear(req.user.id, {
      titulo: cleanTitulo,
      contenido: cleanContenido,
      imagen: cleanImagen,
      categoria_id: Number(categoria_id),
      accion,
    });

    return res.status(201).json(blog);
  } catch (error: unknown) {
    return handleError(res, error);
  }
};

/** POST /api/blogs/upload-image */
export const subirImagenBlog = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "NOT_AUTHENTICATED" });

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Debes adjuntar una imagen del blog" });
    }

    const uploaded = await blogsService.subirImagen(req.file, req.user.id);

    return res.status(201).json(uploaded);
  } catch (error: unknown) {
    return handleError(res, error);
  }
};

/** GET /api/blogs */
export const listarBlogs = async (req: Request, res: Response) => {
  try {
    const { categoria_id, page, limit } = req.query;
    const result = await blogsService.listar({
      categoria_id: categoria_id ? Number(categoria_id) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
    return res.json(result);
  } catch (error: unknown) {
    return handleError(res, error);
  }
};

/** GET /api/blogs/:id */
export const obtenerBlog = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const blog = await blogsService.obtener(id);
    return res.json(blog);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "BLOG_NOT_FOUND") {
      return res.status(404).json({ message: "Blog no encontrado" });
    }
    return handleError(res, error);
  }
};

/** GET /api/blogs/mis-blogs */
export const misBlogs = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "NOT_AUTHENTICATED" });
    const blogs = await blogsService.misBlogs(req.user.id);
    return res.json(blogs);
  } catch (error: unknown) {
    return handleError(res, error);
  }
};

/** DELETE /api/blogs/:id */
export const eliminarBlog = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "NOT_AUTHENTICATED" });

    const id = Number(req.params.id);
    await blogsService.eliminar(id, req.user.id);

    return res.status(204).send();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "BLOG_NOT_FOUND")
        return res.status(404).json({ message: "Blog no encontrado" });
      if (error.message === "FORBIDDEN")
        return res
          .status(403)
          .json({ message: "No tienes permiso para eliminar este blog" });
    }
    return handleError(res, error);
  }
};

/** PATCH /api/blogs/:id */
export const actualizarBlog = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "NOT_AUTHENTICATED" });

    const id = Number(req.params.id);
    const { titulo, contenido, imagen, categoria_id, accion } = req.body;
    const cleanTitulo = typeof titulo === "string" ? titulo.trim() : "";
    const cleanContenido =
      typeof contenido === "string" ? contenido.trim() : "";
    const cleanImagen = typeof imagen === "string" ? imagen.trim() : "";

    if (!cleanTitulo || !cleanContenido || !cleanImagen || !categoria_id) {
      return res.status(400).json({
        message: "titulo, contenido, imagen y categoria_id son requeridos",
      });
    }

    if (accion && !["borrador", "pendiente"].includes(accion)) {
      return res
        .status(400)
        .json({ message: "accion debe ser 'borrador' o 'pendiente'" });
    }

    const blog = await blogsService.actualizar(id, req.user.id, {
      titulo: cleanTitulo,
      contenido: cleanContenido,
      imagen: cleanImagen,
      categoria_id: Number(categoria_id),
      accion,
    });

    return res.json(blog);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "BLOG_NOT_FOUND")
        return res.status(404).json({ message: "Blog no encontrado" });
      if (error.message === "FORBIDDEN")
        return res
          .status(403)
          .json({ message: "No tienes permiso para editar este blog" });
      if (error.message === "BLOG_NOT_EDITABLE")
        return res.status(409).json({
          message:
            "Solo puedes editar blogs en estado BORRADOR, PENDIENTE, PUBLICADO o RECHAZADO",
        });
    }
    return handleError(res, error);
  }
};

/** PATCH /api/blogs/:id/resubmit — Autor del blog */
export const resubmitBlog = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "NOT_AUTHENTICATED" });

    const id = Number(req.params.id);
    const blog = await blogsService.resubmit(id, req.user.id);
    return res.json(blog);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "BLOG_NOT_FOUND")
        return res.status(404).json({ message: "Blog no encontrado" });
      if (error.message === "FORBIDDEN")
        return res
          .status(403)
          .json({ message: "No tienes permiso para reenviar este blog" });
      if (error.message === "BLOG_NOT_REJECTED")
        return res.status(409).json({
          message: "Solo puedes reenviar blogs en estado RECHAZADO",
        });
    }
    return handleError(res, error);
  }
};

/** PATCH /api/blogs/:id/estado — Solo Admin */
export const cambiarEstadoBlog = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "NOT_AUTHENTICATED" });

    const id = Number(req.params.id);
    const { estado, razon_rechazo } = req.body;

    if (!["PUBLICADO", "RECHAZADO"].includes(estado)) {
      return res
        .status(400)
        .json({ message: "estado debe ser 'PUBLICADO' o 'RECHAZADO'" });
    }

    const blog = await blogsService.cambiarEstado(id, estado, razon_rechazo);
    return res.json(blog);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "BLOG_NOT_FOUND")
        return res.status(404).json({ message: "Blog no encontrado" });
      if (error.message === "BLOG_NOT_PENDING")
        return res.status(409).json({
          message: "Solo puedes cambiar el estado de blogs en estado PENDIENTE",
        });
      if (error.message === "RAZON_RECHAZO_REQUIRED")
        return res
          .status(400)
          .json({ message: "Debes proporcionar una razón de rechazo" });
      if (error.message === "RAZON_RECHAZO_TOO_LONG")
        return res
          .status(400)
          .json({ message: "El comentario de rechazo no puede superar los 500 caracteres" });
    }
    return handleError(res, error);
  }
};

/** GET /api/blogs/admin — Solo Admin */
export const listarBlogsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { estado, categoria_id, page, limit } = req.query;
    const result = await blogsService.listarAdmin({
      estado: estado as estado_blog,
      categoria_id: categoria_id ? Number(categoria_id) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
    return res.json(result);
  } catch (error: unknown) {
    return handleError(res, error);
  }
};

/** GET /api/blogs/categorias */
export const listarCategorias = async (req: Request, res: Response) => {
  try {
    const categorias = await blogsService.listarCategorias();
    return res.json(categorias);
  } catch (error: unknown) {
    return handleError(res, error);
  }
};

// ──────────────────────────────────────────
// COMENTARIOS CONTROLLERS
// ──────────────────────────────────────────

/** POST /api/comentarios */
export const crearComentario = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "NOT_AUTHENTICATED" });

    const { contenido, blog_id, comentario_padre_id } = req.body;

    if (!contenido || !blog_id) {
      return res
        .status(400)
        .json({ message: "contenido y blog_id son requeridos" });
    }

    const comentario = await comentariosService.crear({
      contenido,
      usuario_id: req.user.id,
      blog_id: Number(blog_id),
      comentario_padre_id: comentario_padre_id
        ? Number(comentario_padre_id)
        : undefined,
    });

    return res.status(201).json(comentario);
  } catch (error: unknown) {
    return handleError(res, error);
  }
};

/** GET /api/blogs/:id/comentarios */
export const listarComentarios = async (req: Request, res: Response) => {
  try {
    const blog_id = Number(req.params.id);
    const { page, limit } = req.query;

    let usuario_id: number | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        try {
          verifyJwtToken(token);
          const session = await findActiveSessionByToken(token);
          if (session) {
            usuario_id = session.usuario.id;
          }
        } catch (err) {
          console.error("Error al extraer sesion para comentarios:", err);
        }
      }
    }

    const comentarios = await comentariosService.listarPorBlog(
      blog_id,
      usuario_id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );

    return res.json(comentarios);
  } catch (error: unknown) {
    return handleError(res, error);
  }
};

/** PATCH /api/comentarios/:id */
export const actualizarComentario = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "NOT_AUTHENTICATED" });

    const id = Number(req.params.id);
    const { contenido } = req.body;

    if (!contenido) {
      return res.status(400).json({ message: "contenido es requerido" });
    }

    if (contenido.length > 500) {
      return res
        .status(400)
        .json({ message: "El comentario no puede exceder los 500 caracteres" });
    }

    const comentario = await comentariosService.actualizar(id, req.user.id, {
      contenido,
    });

    return res.json(comentario);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "COMENTARIO_NOT_FOUND")
        return res.status(404).json({ message: "Comentario no encontrado" });
      if (error.message === "FORBIDDEN")
        return res
          .status(403)
          .json({ message: "No tienes permiso para editar este comentario" });
    }
    return handleError(res, error);
  }
};

/** POST /api/comentarios/:id/like */
export const toggleLikeComentario = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "NOT_AUTHENTICATED" });

    const comentario_id = Number(req.params.id);
    const result = await comentariosService.toggleLike(
      req.user.id,
      comentario_id,
    );

    return res.json(result);
  } catch (error: unknown) {
    return handleError(res, error);
  }
};

/** DELETE /api/comentarios/:id */
export const eliminarComentario = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "NOT_AUTHENTICATED" });

    const id = Number(req.params.id);
    await comentariosService.eliminar(id, req.user.id);

    return res.status(204).send();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "COMENTARIO_NOT_FOUND")
        return res.status(404).json({ message: "Comentario no encontrado" });
      if (error.message === "FORBIDDEN")
        return res
          .status(403)
          .json({ message: "No tienes permiso para eliminar este comentario" });
    }
    return handleError(res, error);
  }
};

// ──────────────────────────────────────────
// HELPER
// ──────────────────────────────────────────

function handleError(res: Response, error: unknown) {
  console.error("❌ Error:", error);
  if (error instanceof Error) {
    return res.status(500).json({ message: error.message });
  }
  return res.status(500).json({ message: "Error interno del servidor" });
}
