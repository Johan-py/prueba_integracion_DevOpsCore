import { prisma } from '../../lib/prisma.client.js'

const findAll = async () => {
  return prisma.parametros_personalizados.findMany({
    orderBy: { nombre: 'asc' }
  })
}

const findByName = async (nombre: string) => {
  return prisma.parametros_personalizados.findFirst({
    where: {
      nombre: {
        equals: nombre.trim(),
        mode: 'insensitive'
      }
    }
  })
}

const create = async (nombre: string, descripcion?: string) => {
  return prisma.parametros_personalizados.create({
    data: {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null
    }
  })
}

const findByPublicationId = async (publicacionId: number) => {
  return prisma.publicacion_parametro.findMany({
    where: { publicacion_id: publicacionId },
    include: {
      parametros_personalizados: true
    },
    orderBy: {
      id: 'asc'
    }
  })
}

const replacePublicationParameters = async (
  publicacionId: number,
  parametros: Array<{ parametroId: number; valor?: string | null }>
) => {
  return prisma.$transaction(async (tx) => {
    await tx.publicacion_parametro.deleteMany({
      where: { publicacion_id: publicacionId }
    })

    if (parametros.length === 0) {
      return []
    }

    for (const item of parametros) {
      await tx.publicacion_parametro.create({
        data: {
          publicacion_id: publicacionId,
          parametro_id: item.parametroId,
          valor: item.valor ?? null
        }
      })
    }

    return tx.publicacion_parametro.findMany({
      where: { publicacion_id: publicacionId },
      include: {
        parametros_personalizados: true
      }
    })
  })
}

const removePublicationParameter = async (publicacionId: number, parametroId: number) => {
  return prisma.publicacion_parametro.deleteMany({
    where: {
      publicacion_id: publicacionId,
      parametro_id: parametroId
    }
  })
}

const findPublicationOwner = async (publicacionId: number) => {
  return prisma.publicacion.findUnique({
    where: { id: publicacionId },
    select: {
      id: true,
      usuarioId: true
    }
  })
}

export const parametrosPersonalizadosRepository = {
  findAll,
  findByName,
  create,
  findByPublicationId,
  replacePublicationParameters,
  removePublicationParameter,
  findPublicationOwner
}
