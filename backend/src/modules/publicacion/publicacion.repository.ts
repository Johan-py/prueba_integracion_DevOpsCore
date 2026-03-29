import { EstadoPublicacion } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'

export const buscarPublicacionesPorUsuarioRepository = async (usuarioId: number) => {
  return prisma.publicacion.findMany({
    where: {
      usuarioId,
      estado: {
        not: EstadoPublicacion.ELIMINADA
      }
    },
    include: {
      multimedia: true,
      inmueble: {
        include: {
          ubicacion: true
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
        estado: 'ELIMINADA'
      }
    }),
    prisma.inmueble.update({
      where: { id: inmuebleId },
      data: {
        estado: 'INACTIVO'
      }
    })
  ])
}
