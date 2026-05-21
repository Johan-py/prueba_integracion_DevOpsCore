import { prisma } from "../../lib/prisma.client.js";

export const testimoniosRepository = {
  async findAll(params: { ciudad?: string; usuarioId?: number }) {
    const { ciudad, usuarioId } = params;

    const where = {
      visible: true,
      eliminado: false,
      ...(ciudad && ciudad !== "Todos" ? { ciudad } : {}),
    };

    const testimonios = await prisma.testimonio.findMany({
      where,
      orderBy: { fecha_creacion: "desc" },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            avatar: true,
          },
        },
        testimonio_like: true,
      },
    });

    return testimonios.map((t) => ({
      id: t.id,
      comentario: t.comentario,
      calificacion: t.calificacion,
      ciudad: t.ciudad,
      zona: t.zona,
      categoria: t.categoria,
      fecha_creacion: t.fecha_creacion,
      usuario: {
        id: t.usuario.id,
        nombre: t.usuario.nombre,
        apellido: t.usuario.apellido,
        avatar: t.usuario.avatar,
        iniciales:
          `${t.usuario.nombre[0] ?? ""}${t.usuario.apellido[0] ?? ""}`.toUpperCase(),
      },
      totalLikes: t.testimonio_like.length,
      meGusta: usuarioId
        ? t.testimonio_like.some((l) => l.usuario_id === usuarioId)
        : false,
    }));
  },

  async findById(id: number) {
    return prisma.testimonio.findUnique({ where: { id } });
  },

  async findLike(testimonioId: number, usuarioId: number) {
    return prisma.testimonio_like.findUnique({
      where: {
        testimonio_id_usuario_id: {
          testimonio_id: testimonioId,
          usuario_id: usuarioId,
        },
      },
    });
  },

  async createLike(testimonioId: number, usuarioId: number) {
    return prisma.testimonio_like.create({
      data: { testimonio_id: testimonioId, usuario_id: usuarioId },
    });
  },

  async deleteLike(id: number) {
    return prisma.testimonio_like.delete({ where: { id } });
  },

  async countLikes(testimonioId: number) {
    return prisma.testimonio_like.count({
      where: { testimonio_id: testimonioId },
    });
  },
};
