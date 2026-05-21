import { Publicacion } from "@prisma/client";
// ✅ Ruta corregida: apunta al prisma.client.ts de tu equipo
import { prisma } from "../../lib/prisma.client.js";

export const publicacionesRepository = {
  async findAll(): Promise<Publicacion[]> {
    return prisma.publicacion.findMany();
  },

  async findGratis(): Promise<Publicacion[]> {
    // Ajusta el campo según tu schema.prisma (ejemplo: costo en vez de precio)
    return prisma.publicacion.findMany({
      where: { inmueble: { precio: 0 } },
    });
  },

  async countByUser(userId: number): Promise<number> {
    return prisma.publicacion.count({ where: { usuarioId: userId } });
  },

  async findByUserId(userId: number): Promise<Publicacion[]> {
    return prisma.publicacion.findMany({
      where: { usuarioId: userId },
      include: {
        inmueble: {
          include: {
            ubicacion: true,
          },
        },
        multimedia: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            correo: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        fechaPublicacion: "desc",
      },
    });
  },

  async create(
    userId: number,
    data: Omit<Publicacion, "id" | "usuarioId">,
  ): Promise<Publicacion> {
    return prisma.publicacion.create({
      data: {
        ...data,
        usuarioId: userId,
      },
    });
  },

  async findById(id: number) {
    return prisma.publicacion.findUnique({
      where: { id: id },
      include: {
        inmueble: true,
        multimedia: true,
      },
    });
  },

  async deleteById(id: number) {
    return prisma.publicacion.delete({
      where: { id: id },
    });
  },

  async updateEstado(id: number, activa: boolean) {
    // ✅ ACTIVA cuando el toggle está ON, PAUSADA cuando está OFF
    const estado = activa ? "ACTIVA" : "PAUSADA";

    return prisma.publicacion.update({
      where: { id: id },
      data: { estado: estado },
    });
  },

  // Nueva función HU‑5 v2 reforzada (solo límite)
  async validarPublicacionHU5(userId: number) {
    const count = await publicacionesRepository.countByUser(userId);
    const limiteGratis = 2;

    if (count >= limiteGratis) {
      throw new Error("LIMIT_REACHED");
    }

    return {
      estado: "Validado",
      mensaje: "Publicación lista para guardar",
    };
  },
};
