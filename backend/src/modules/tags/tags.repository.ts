import { prisma } from '../../lib/prisma.client.js'

const findAll = async () => {
  const tags = await prisma.tag.findMany({
    orderBy: { nombre: 'asc' }
  })

  const publicacionesTags = await prisma.publicacion_tag.findMany({
    where: {
      publicacion: {
        estado: 'ACTIVA'
      }
    },
    select: {
      tag_id: true
    }
  })

  const countMap = new Map<number, number>()

  for (const row of publicacionesTags) {
    const currentCount = countMap.get(row.tag_id) ?? 0
    countMap.set(row.tag_id, currentCount + 1)
  }

  return tags.map((tag) => ({
    id: tag.id,
    nombre: tag.nombre,
    creado_en: tag.creado_en,
    cantidad: countMap.get(tag.id) ?? 0
  }))
}

const findByName = async (nombre: string) => {
  return prisma.tag.findFirst({
    where: {
      nombre: {
        equals: nombre.trim(),
        mode: 'insensitive'
      }
    }
  })
}

const findOrCreate = async (nombre: string) => {
  const existing = await findByName(nombre)
  if (existing) return existing

  return prisma.tag.create({
    data: { nombre: nombre.trim() }
  })
}

const findByPublicacionId = async (publicacionId: number) => {
  return prisma.publicacion_tag.findMany({
    where: { publicacion_id: publicacionId },
    include: { tag: true },
    orderBy: { agregado_en: 'asc' }
  })
}

const replacePublicacionTags = async (publicacionId: number, tagIds: number[]) => {
  return prisma.$transaction(async (tx) => {
    await tx.publicacion_tag.deleteMany({
      where: { publicacion_id: publicacionId }
    })

    if (tagIds.length === 0) return []

    await tx.publicacion_tag.createMany({
      data: tagIds.map((tagId) => ({
        publicacion_id: publicacionId,
        tag_id: tagId
      })),
      skipDuplicates: true
    })

    return tx.publicacion_tag.findMany({
      where: { publicacion_id: publicacionId },
      include: { tag: true }
    })
  })
}

const findPublicacionOwner = async (publicacionId: number) => {
  return prisma.publicacion.findUnique({
    where: { id: publicacionId },
    select: { id: true, usuarioId: true }
  })
}

export const tagsRepository = {
  findAll,
  findByName,
  findOrCreate,
  findByPublicacionId,
  replacePublicacionTags,
  findPublicacionOwner
}
