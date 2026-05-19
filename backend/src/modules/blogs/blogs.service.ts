import { estado_blog } from "@prisma/client";
import { blogsRepository, comentariosRepository } from "./blogs.repository.js";
import {
  createBlogNotificationService,
  createAdminBlogPendingNotificationService,
} from "../notificaciones/notificaciones.service.js";
import { getIO } from "../../services/socket.service.js";

// BLOGS SERVICE PE

export const blogsService = {
  async listar(params: {
    categoria_id?: number;
    page?: number;
    limit?: number;
  }) {
    return blogsRepository.findAll(params);
  },

  async misBlogs(usuario_id: number) {
    return blogsRepository.findByUserId(usuario_id);
  },

  async obtener(id: number) {
    const blog = await blogsRepository.findById(id);
    if (!blog) throw new Error("BLOG_NOT_FOUND");
    return blog;
  },

  async crear(
    usuario_id: number,
    data: {
      titulo: string;
      contenido: string;
      imagen?: string;
      categoria_id: number;
      accion: "borrador" | "pendiente";
    },
  ) {
    const estado: estado_blog =
      data.accion === "pendiente" ? "PENDIENTE" : "BORRADOR";

    const blog = await blogsRepository.create({
      titulo: data.titulo,
      contenido: data.contenido,
      imagen: data.imagen,
      categoria_id: data.categoria_id,
      usuario_id,
      estado,
    });

    if (estado === "PENDIENTE") {
      try {
        await createAdminBlogPendingNotificationService({
          blog_id: blog.id,
          blogTitulo: blog.titulo,
        });
      } catch (e) {
        console.error("[Blog] Error al notificar al admin (crear):", e);
      }
      const io = getIO();
      io.emit("admin:nuevo_blog_pendiente", blog);
      io.emit(`usuario:${usuario_id}:actualizar_mis_blogs`, blog);
    }

    return blog;
  },

  async actualizar(
    id: number,
    usuario_id: number,
    data: {
      titulo?: string;
      contenido?: string;
      imagen?: string;
      categoria_id?: number;
      accion?: "borrador" | "pendiente";
    },
  ) {
    const blog = await blogsRepository.findById(id);
    if (!blog) throw new Error("BLOG_NOT_FOUND");
    if (blog.usuario_id !== usuario_id) throw new Error("FORBIDDEN");
    if (
      blog.estado !== "BORRADOR" &&
      blog.estado !== "PENDIENTE" &&
      blog.estado !== "PUBLICADO" &&
      blog.estado !== "RECHAZADO"
    ) {
      throw new Error("BLOG_NOT_EDITABLE");
    }

    let estado: estado_blog | undefined;

    if (blog.estado === "PENDIENTE") {
      estado = "PENDIENTE";
    } else if (blog.estado === "PUBLICADO" || blog.estado === "RECHAZADO") {
      estado = "PENDIENTE";
    } else if (data.accion === "pendiente") {
      estado = "PENDIENTE";
    } else if (data.accion === "borrador") {
      estado = "BORRADOR";
    }

    const wasNotPending = blog.estado !== "PENDIENTE";

    const updatedBlog = await blogsRepository.update(id, {
      titulo: data.titulo,
      contenido: data.contenido,
      imagen: data.imagen,
      categoria_id: data.categoria_id,
      ...(estado ? { estado } : {}),
    });

    if (wasNotPending && updatedBlog.estado === "PENDIENTE") {
      try {
        await createAdminBlogPendingNotificationService({
          blog_id: id,
          blogTitulo: updatedBlog.titulo,
        });
      } catch (e) {
        console.error("[Blog] Error al notificar al admin (actualizar):", e);
      }
    }

    const io = getIO();
    io.emit("blog:actualizado", updatedBlog);
    io.emit(`usuario:${usuario_id}:actualizar_mis_blogs`, updatedBlog);

    return updatedBlog;
  },

  async subirImagen(file: Express.Multer.File, usuario_id: number) {
    return blogsRepository.uploadImage(file, usuario_id);
  },

  async cambiarEstado(
    id: number,
    estado: "PUBLICADO" | "RECHAZADO",
    razon_rechazo?: string,
  ) {
    const blog = await blogsRepository.findById(id);
    if (!blog) throw new Error("BLOG_NOT_FOUND");
    if (blog.estado !== "PENDIENTE") throw new Error("BLOG_NOT_PENDING");
    if (estado === "RECHAZADO" && !razon_rechazo) {
      throw new Error("RAZON_RECHAZO_REQUIRED");
    }
    if (razon_rechazo && razon_rechazo.length > 500) {
      throw new Error("RAZON_RECHAZO_TOO_LONG");
    }

    const updatedBlog = await blogsRepository.changeEstado(
      id,
      estado as estado_blog,
      razon_rechazo,
    );

    try {
      await createBlogNotificationService({
        usuarioId: blog.usuario_id,
        blog_id: id,
        blogTitulo: blog.titulo,
        tipo: estado === "PUBLICADO" ? "BLOG_APROBADO" : "BLOG_RECHAZADO",
        ...(razon_rechazo ? { razonRechazo: razon_rechazo } : {}),
      });
    } catch (notifError) {
      console.error("[Blog] Error al crear notificación de blog:", notifError);
    }

    const io = getIO();
    if (estado === "PUBLICADO") {
      io.emit("blog:publicado_global", updatedBlog);
    }
    io.emit(`usuario:${blog.usuario_id}:actualizar_mis_blogs`, updatedBlog);
    io.emit("admin:blog_revisado", { id, estado });

    return updatedBlog;
  },

  async resubmit(id: number, usuario_id: number) {
    const blog = await blogsRepository.findById(id);
    if (!blog) throw new Error("BLOG_NOT_FOUND");
    if (blog.usuario_id !== usuario_id) throw new Error("FORBIDDEN");
    if (blog.estado !== "RECHAZADO") throw new Error("BLOG_NOT_REJECTED");

    const updatedBlog = await blogsRepository.resubmit(id);

    try {
      await createAdminBlogPendingNotificationService({
        blog_id: id,
        blogTitulo: blog.titulo,
      });
    } catch (e) {
      console.error("[Blog] Error al notificar al admin (resubmit):", e);
    }

    return updatedBlog;
  },

  async eliminar(id: number, usuario_id: number) {
    const blog = await blogsRepository.findById(id);
    if (!blog) {
      throw new Error("BLOG_NOT_FOUND");
    }
    if (blog.usuario_id !== usuario_id) {
      throw new Error("FORBIDDEN");
    }
    const blogEliminado = await blogsRepository.delete(id);
    const io = getIO();
    io.emit("blog:eliminado_global", { id });
    io.emit(`blog:${id}:notificacion_eliminado`);
    return blogEliminado;
  },

  async listarAdmin(params: {
    estado?: estado_blog;
    categoria_id?: number;
    page?: number;
    limit?: number;
  }) {
    return blogsRepository.findAllAdmin(params);
  },

  async listarCategorias() {
    return blogsRepository.findAllCategories();
  },
};

// COMENTARIOS SERVICE
export const comentariosService = {
  async crear(data: {
    contenido: string;
    usuario_id: number;
    blog_id: number;
    comentario_padre_id?: number;
  }) {
    const nuevoComentario = await comentariosRepository.create(data);
    getIO().emit(`blog:${data.blog_id}:nuevo_comentario`, nuevoComentario);
    return nuevoComentario;
  },

  async listarPorBlog(
    blog_id: number,
    usuario_id?: number,
    page: number = 1,
    limit: number = 10,
  ) {
    return comentariosRepository.findByBlogId({
      blog_id,
      usuario_id,
      page,
      limit,
    });
  },

  async actualizar(
    id: number,
    usuario_id: number,
    data: { contenido: string },
  ) {
    const comentario = await comentariosRepository.findById(id);
    if (!comentario) throw new Error("COMENTARIO_NOT_FOUND");
    if (comentario.usuario_id !== usuario_id) throw new Error("FORBIDDEN");

    const comentarioActualizado = await comentariosRepository.update(id, data);
    getIO().emit(
      `blog:${comentario.blog_id}:comentario_actualizado`,
      comentarioActualizado,
    );
    return comentarioActualizado;
  },

  async toggleLike(usuario_id: number, comentario_id: number) {
    return comentariosRepository.toggleLike(usuario_id, comentario_id);
  },

  async eliminar(id: number, usuario_id: number) {
    const comentario = await comentariosRepository.findById(id);
    if (!comentario) throw new Error("COMENTARIO_NOT_FOUND");
    if (comentario.usuario_id !== usuario_id) throw new Error("FORBIDDEN");
    const comentarioEliminado = await comentariosRepository.delete(id);
    getIO().emit(`blog:${comentario.blog_id}:comentario_eliminado`, { id });
    return comentarioEliminado;
  },
};
