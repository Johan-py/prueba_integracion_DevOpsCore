// backend/src/modules/publicaciones/publicacion.repository.ts
import { prisma } from "../../lib/prisma.js";

const ESTADO_PUBLICACION_ELIMINADA = "ELIMINADA" as const;
const ESTADO_INMUEBLE_INACTIVO = "INACTIVO" as const;

/**
 * Buscar todas las publicaciones activas de un usuario
 * - No debe incluir publicaciones eliminadas
 * - Ordenadas por fecha de publicación descendente
 */
export const buscarPublicacionesPorUsuarioRepository = async (
  usuarioId: number,
) => {
  return prisma.publicacion.findMany({
    where: {
      usuarioId,
      estado: {
        not: ESTADO_PUBLICACION_ELIMINADA,
      },
    },
    include: {
      multimedia: true,
      inmueble: {
        include: {
          ubicacion: {
            select: {
              id: true,
              direccion: true,
              latitud: true,
              longitud: true,
              inmuebleId: true,
              ubicacionMaestraId: true,
            },
          },
        },
      },
    },
    orderBy: {
      fechaPublicacion: "desc",
    },
  });
};

/**
 * Buscar una publicación por ID
 * - Incluye datos del inmueble asociado
 */
export const buscarPublicacionPorIdRepository = async (id: number) => {
  return prisma.publicacion.findUnique({
    where: { id },
    include: {
      inmueble: true,
      multimedia: true,
    },
  });
};

/**
 * Eliminar lógicamente una publicación
 * - Cambia estado de publicación a ELIMINADA
 * - Cambia estado de inmueble a INACTIVO
 */
export const eliminarLogicamentePublicacionRepository = async (
  publicacionId: number,
  inmuebleId: number,
) => {
  return prisma.$transaction([
    prisma.publicacion.update({
      where: { id: publicacionId },
      data: {
        estado: ESTADO_PUBLICACION_ELIMINADA,
      },
    }),
    prisma.inmueble.update({
      where: { id: inmuebleId },
      data: {
        estado: ESTADO_INMUEBLE_INACTIVO,
      },
    }),
  ]);
};
