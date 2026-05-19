// FavoritesService.ts
import { prisma } from "../../lib/prisma.client.js";

export class FavoritesService {
  static async getAll(usuarioId: number, page: number, perPage: number) {
    const skip = (page - 1) * perPage;

    const [total, favoritos] = await Promise.all([
      prisma.favorito.count({ where: { usuarioId } }),
      prisma.favorito.findMany({
        where: { usuarioId },
        skip,
        take: perPage,
        orderBy: { agregadoEn: "desc" },
        include: {
          inmueble: {
            include: {
              ubicacion: true,
              publicaciones: {
                where: { estado: "ACTIVA" }, // Solo publicaciones activas
                include: { multimedia: true },
                take: 1,
              },
            },
          },
        },
      }),
    ]);

    // Por esto:
    return {
      total,
      page,
      per_page: perPage,
      data: favoritos.map((f) => ({
        id: f.id,
        agregadoEn: f.agregadoEn,
        inmueble: {
          ...f.inmueble,
          imagen_principal:
            f.inmueble.publicaciones[0]?.multimedia[0]?.url || null,
        },
      })),
      totalPages: Math.ceil(total / perPage),
    };
  }

  static async add(usuarioId: number, inmuebleId: number) {
    console.log("[DEBUG] FavoritesService.add llamado:", usuarioId, inmuebleId);
    try {
      const favorito = await prisma.favorito.create({
        data: { usuarioId, inmuebleId },
      });

      console.log(
        "[DEBUG] Buscando inmueble para entrenamiento_ml:",
        inmuebleId,
      );
      const inmueble = await prisma.inmueble.findUnique({
        where: { id: inmuebleId },
        include: { ubicacion: true, inmueble_amenidad: true },
      });
      console.log("[DEBUG] Inmueble encontrado:", inmueble?.id);
      if (inmueble) {
        try {
          await prisma.entrenamiento_ml.create({
            data: {
              usuario_id: usuarioId,
              inmueble_id: inmuebleId,
              tipo_evento: "FAVORITO",
              score_real: 1.0,
              features: {
                categoria: inmueble.categoria,
                tipoAccion: inmueble.tipoAccion,
                precio: Number(inmueble.precio),
                superficieM2: Number(inmueble.superficieM2 || 0),
                nroCuartos: inmueble.nroCuartos || 0,
                nroBanos: inmueble.nroBanos || 0,
                zona: inmueble.ubicacion?.zona || null,
                ciudad: inmueble.ubicacion?.ciudad || null,
                amenidades: inmueble.inmueble_amenidad.map(
                  (a) => a.amenidad_id,
                ),
                precioReducido:
                  inmueble.precio_anterior !== null &&
                  Number(inmueble.precio_anterior) > Number(inmueble.precio),
              },
              usado_en_modelo: false,
            },
          });
          console.log("[ML] Registro guardado en entrenamiento_ml");
        } catch (err) {
          console.error("[ML] Error guardando en entrenamiento_ml:", err);
        }
      }

      return favorito;
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new Error("ALREADY_EXISTS");
      }
      throw error;
    }
  }
  static async remove(usuarioId: number, inmuebleId: number) {
    try {
      // Eliminar directamente usando el unique compuesto
      return await prisma.favorito.delete({
        where: {
          usuarioId_inmuebleId: {
            usuarioId,
            inmuebleId,
          },
        },
      });
    } catch (error: any) {
      // P2025 es el error de Prisma para registro no encontrado
      if (error.code === "P2025") {
        throw new Error("NOT_FOUND");
      }
      throw error;
    }
  }

  static async isFavorite(
    usuarioId: number,
    inmuebleId: number,
  ): Promise<boolean> {
    try {
      const favorite = await prisma.favorito.findUnique({
        where: {
          usuarioId_inmuebleId: {
            usuarioId,
            inmuebleId,
          },
        },
      });
      return !!favorite;
    } catch (error) {
      return false;
    }
  }
}
