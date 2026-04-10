import { prisma } from '../../lib/prisma.config.js'

export const getPublicacionesByUsuario = async (usuarioId: number) => {
  return prisma.publicacion.findMany({
    where: { usuarioId },
    include: {
      inmueble: {
        include: { ubicacion: true }
      },
      multimedia: true
    }
  })
}

export const updatePublicacion = async (id: number, data: any) => {
  return prisma.publicacion.update({
    where: { id },
    data: {
      titulo: data.titulo,
      descripcion: data.descripcion,
      inmueble: {
        update: {
          tipoAccion: data.tipoAccion,
          precio: data.precio,
          ubicacion: {
            update: { direccion: data.ubicacion }
          }
        }
      }
    },
    include: { inmueble: true }
  })
}

export const deletePublicacion = async (id: number) => {
  return prisma.publicacion.update({
    where: { id },
    data: { estado: 'ELIMINADA' }
  })
}