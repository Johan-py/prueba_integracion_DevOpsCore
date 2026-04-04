import { prisma } from '../../lib/prisma.js'

const ESTADO_PUBLICACION_ELIMINADA = 'ELIMINADA' as const
const ESTADO_INMUEBLE_INACTIVO = 'INACTIVO' as const

export const buscarPublicacionesPorUsuarioRepository = async (usuarioId: number) => {
  return prisma.publicacion.findMany({
    where: {
      usuarioId,
      estado: {
        not: ESTADO_PUBLICACION_ELIMINADA
      }
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
              ubicacionMaestraId: true
            }
          }
        }
      }
    },
    orderBy: {
      fechaPublicacion: 'desc'
    }
  })
}

export const buscarPublicacionPorIdRepository = async (id: number) => {
  return prisma.publicacion.findUnique({
    where: { id },
    include: {
      inmueble: true
    }
  })
}

export const eliminarLogicamentePublicacionRepository = async (
  publicacionId: number,
  inmuebleId: number
) => {
  return prisma.$transaction([
    prisma.publicacion.update({
      where: { id: publicacionId },
      data: {
        estado: ESTADO_PUBLICACION_ELIMINADA
      }
    }),
    prisma.inmueble.update({
      where: { id: inmuebleId },
      data: {
        estado: ESTADO_INMUEBLE_INACTIVO
      }
    })
  ])
}
