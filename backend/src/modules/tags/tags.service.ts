import { tagsRepository } from './tags.repository.js'

const MAX_TAGS = 15

const getAll = async () => {
  return tagsRepository.findAll()
}

const getTagsByPublicacion = async (publicacionId: number) => {
  return tagsRepository.findByPublicacionId(publicacionId)
}

const replacePublicacionTags = async (publicacionId: number, userId: number, nombres: string[]) => {
  const publicacion = await tagsRepository.findPublicacionOwner(publicacionId)

  if (!publicacion) throw new Error('PUBLICATION_NOT_FOUND')

  if (publicacion.usuarioId !== userId) {
    throw new Error('FORBIDDEN')
  }

  const nombresNormalizados = [...new Set(nombres.map((tag) => tag.trim().toLowerCase()))]

  if (nombresNormalizados.length > MAX_TAGS) {
    throw new Error('MAX_TAGS_EXCEEDED')
  }

  const tagIds: number[] = []

  for (const nombre of nombresNormalizados) {
    const tag = await tagsRepository.findOrCreate(nombre)
    tagIds.push(tag.id)
  }

  return tagsRepository.replacePublicacionTags(publicacionId, tagIds)
}

export const tagsService = {
  getAll,
  getTagsByPublicacion,
  replacePublicacionTags
}
