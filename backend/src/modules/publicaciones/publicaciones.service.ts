import { publicacionesRepository } from "./publicaciones.repository.js";
import { Publicacion } from "@prisma/client";

export const publicacionesService = {
  async listarTodas(): Promise<Publicacion[]> {
    return publicacionesRepository.findAll();
  },

  async listarGratis(): Promise<Publicacion[]> {
    return publicacionesRepository.findGratis();
  },

  async crear(userId: number, data: Partial<Publicacion>): Promise<Publicacion> {
  const count = await publicacionesRepository.countByUser(userId);
  if (count >= 2) {
    throw new Error("Has alcanzado el límite de publicaciones gratuitas.");
  }
  return publicacionesRepository.create(userId, data as Omit<Publicacion, "id" | "usuarioId">);
},

  async validarFlujo(userId: number): Promise<string> {
    const count = await publicacionesRepository.countByUser(userId);
    if (count >= 2) {
      throw new Error("Límite de publicaciones alcanzado.");
    }
    return "Acceso permitido al flujo de publicación.";
  },
};
