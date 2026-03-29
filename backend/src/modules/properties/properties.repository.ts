import { PrismaClient, Categoria, TipoAccion } from "@prisma/client";
import { PropertyFilters } from "./properties.types.js";

const prisma = new PrismaClient();

class PropertyRepository {
  async findWithFilters(filters: PropertyFilters) {
    return prisma.inmueble.findMany({
      where: {
        categoria: filters.categoria as Categoria | undefined,
        tipoAccion: filters.tipoAccion as TipoAccion | undefined,
        ubicacion: filters.ciudad
          ? {
              ciudad: filters.ciudad,
            }
          : undefined,
      },
      include: {
        ubicacion: true,
      },
    });
  }
}

export const propertyRepository = new PropertyRepository();