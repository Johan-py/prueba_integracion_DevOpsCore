import { parametrosPersonalizadosRepository } from '../parametros-publicacion/parametros.repository.js'

const getAll = async () => {
  return parametrosPersonalizadosRepository.findAll()
}

const createParameter = async (nombre: string, descripcion?: string) => {
  const existing = await parametrosPersonalizadosRepository.findByName(nombre)

  if (existing) {
    throw new Error('PARAMETER_ALREADY_EXISTS')
  }

  return parametrosPersonalizadosRepository.create(nombre, descripcion)
}

const getPublicationParameters = async (publicacionId: number) => {
  return parametrosPersonalizadosRepository.findByPublicationId(publicacionId)
}

const replacePublicationParameters = async (
  publicacionId: number,
  userId: number,
  parametros: Array<{ parametroId: number; valor?: string | null }>
) => {
  const publication = await parametrosPersonalizadosRepository.findPublicationOwner(publicacionId)

  if (!publication) {
    throw new Error('PUBLICATION_NOT_FOUND')
  }

  if (publication.usuarioId !== userId) {
    throw new Error('FORBIDDEN')
  }

  return parametrosPersonalizadosRepository.replacePublicationParameters(publicacionId, parametros)
}

const removePublicationParameter = async (
  publicacionId: number,
  parametroId: number,
  userId: number
) => {
  const publication = await parametrosPersonalizadosRepository.findPublicationOwner(publicacionId)

  if (!publication) {
    throw new Error('PUBLICATION_NOT_FOUND')
  }

  if (publication.usuarioId !== userId) {
    throw new Error('FORBIDDEN')
  }

  return parametrosPersonalizadosRepository.removePublicationParameter(publicacionId, parametroId)
}

export const parametrosPersonalizadosService = {
  getAll,
  createParameter,
  getPublicationParameters,
  replacePublicationParameters,
  removePublicationParameter
}
