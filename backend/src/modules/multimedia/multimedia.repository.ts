import type { TipoMultimedia } from '@prisma/client'
import { prisma } from '../../db.js'
import type {
  MultimediaRecord,
  MultimediaType,
  PublicacionRecord
} from './multimedia.types.js'

const mapPublicationRecord = (publication: {
  id: number
  usuarioId: number
  titulo: string
}): PublicacionRecord => {
  return {
    id: publication.id,
    usuarioId: publication.usuarioId,
    titulo: publication.titulo
  }
}

const mapMultimediaRecord = (multimedia: {
  id: number
  publicacionId: number
  tipo: TipoMultimedia
  url: string
  pesoMb: unknown
}): MultimediaRecord => {
  return {
    id: multimedia.id,
    publicacionId: multimedia.publicacionId,
    tipo: multimedia.tipo as MultimediaType,
    url: multimedia.url,
    pesoMb:
      multimedia.pesoMb === null || multimedia.pesoMb === undefined
        ? null
        : Number(multimedia.pesoMb)
  }
}

export const findPublicationByIdRepository = async (
  publicacionId: number
): Promise<PublicacionRecord | null> => {
  const publication = await prisma.publicacion.findUnique({
    where: { id: publicacionId },
    select: {
      id: true,
      usuarioId: true,
      titulo: true
    }
  })

  return publication ? mapPublicationRecord(publication) : null
}

export const getMultimediaByPublicationIdRepository = async (
  publicacionId: number
): Promise<MultimediaRecord[]> => {
  const multimedia = await prisma.multimedia.findMany({
    where: { publicacionId },
    orderBy: { id: 'asc' },
    select: {
      id: true,
      publicacionId: true,
      tipo: true,
      url: true,
      pesoMb: true
    }
  })

  return multimedia.map(mapMultimediaRecord)
}

export const countMultimediaByPublicationIdAndTypeRepository = async (
  publicacionId: number,
  tipo: MultimediaType
): Promise<number> => {
  return prisma.multimedia.count({
    where: {
      publicacionId,
      tipo: tipo as TipoMultimedia
    }
  })
}

export const createMultimediaRepository = async (
  data: Omit<MultimediaRecord, 'id'>
): Promise<MultimediaRecord> => {
  const created = await prisma.multimedia.create({
    data: {
      publicacionId: data.publicacionId,
      tipo: data.tipo as TipoMultimedia,
      url: data.url,
      pesoMb: data.pesoMb ?? null
    },
    select: {
      id: true,
      publicacionId: true,
      tipo: true,
      url: true,
      pesoMb: true
    }
  })

  return mapMultimediaRecord(created)
}

export const createManyMultimediaRepository = async (
  items: Array<Omit<MultimediaRecord, 'id'>>
): Promise<MultimediaRecord[]> => {
  if (items.length === 0) {
    return []
  }

  const createdItems = await prisma.$transaction(
    items.map((item) =>
      prisma.multimedia.create({
        data: {
          publicacionId: item.publicacionId,
          tipo: item.tipo as TipoMultimedia,
          url: item.url,
          pesoMb: item.pesoMb ?? null
        },
        select: {
          id: true,
          publicacionId: true,
          tipo: true,
          url: true,
          pesoMb: true
        }
      })
    )
  )

  return createdItems.map(mapMultimediaRecord)
}