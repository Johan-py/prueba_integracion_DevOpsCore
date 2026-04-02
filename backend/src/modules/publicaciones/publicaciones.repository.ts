import { Publicacion } from "@prisma/client"
import { prisma } from "../../lib/prisma.js" // usamos el prisma centralizado

export const publicacionesRepository = {
  async findAll(): Promise<Publicacion[]> {
    return prisma.publicacion.findMany()
  },

  async findGratis(): Promise<Publicacion[]> {
    // Ajusta el campo según tu schema.prisma (ejemplo: costo en vez de precio)
    return prisma.publicacion.findMany({
      where: { inmueble: { precio: 0 } },
    })
  },

  async countByUser(userId: number): Promise<number> {
    return prisma.publicacion.count({ where: { usuarioId: userId } })
  },

  async create(
    userId: number,
    data: Omit<Publicacion, "id" | "usuarioId">
  ): Promise<Publicacion> {
    return prisma.publicacion.create({
      data: {
        ...data,
        usuarioId: userId,
      },
    })
  },
}
