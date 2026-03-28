import { EstadoInmueble, EstadoPublicacion } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'

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
        estado: EstadoPublicacion.ELIMINADA
      }
    }),
    prisma.inmueble.update({
      where: { id: inmuebleId },
      data: {
        estado: EstadoInmueble.INACTIVO
      }
    })
  ])
}
