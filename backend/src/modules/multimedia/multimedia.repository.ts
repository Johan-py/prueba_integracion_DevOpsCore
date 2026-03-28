import { MultimediaRecord, MultimediaType, PublicacionRecord } from './multimedia.types.js'

const publicacionesMock: PublicacionRecord[] = [
  { id: 1, usuarioId: 1, titulo: 'Casa en venta' },
  { id: 2, usuarioId: 2, titulo: 'Departamento céntrico' }
]

const multimediaTable: MultimediaRecord[] = [
  {
    id: 1,
    publicacionId: 1,
    tipo: 'IMAGEN',
    url: 'https://example.com/portada.jpg',
    pesoMb: 2.4
  }
]

export const findPublicationByIdRepository = async (publicacionId: number) => {
  return publicacionesMock.find((publication) => publication.id === publicacionId)
}

export const getMultimediaByPublicationIdRepository = async (publicacionId: number) => {
  return multimediaTable.filter((multimedia) => multimedia.publicacionId === publicacionId)
}

export const countMultimediaByPublicationIdAndTypeRepository = async (
  publicacionId: number,
  tipo: MultimediaType
) => {
  return multimediaTable.filter(
    (multimedia) =>
      multimedia.publicacionId === publicacionId &&
      multimedia.tipo === tipo
  ).length
}

export const createMultimediaRepository = async (
  data: Omit<MultimediaRecord, 'id'>
) => {
  const newRecord: MultimediaRecord = {
    id: multimediaTable.length + 1,
    ...data
  }

  multimediaTable.push(newRecord)

  return newRecord
}