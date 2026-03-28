import {
  ALLOWED_YOUTUBE_HOSTS,
  MAX_VIDEOS_PER_PUBLICATION,
  MULTIMEDIA_TYPES
} from './multimedia.constants.js'
import {
  countMultimediaByPublicationIdAndTypeRepository,
  createMultimediaRepository,
  findPublicationByIdRepository,
  getMultimediaByPublicationIdRepository
} from './multimedia.repository.js'
import {
  GetPublicationMultimediaInput,
  RegisterVideoLinkInput
} from './multimedia.types.js'

const isValidYoutubeUrl = (videoUrl: string): boolean => {
  try {
    const parsedUrl = new URL(videoUrl.trim())
    const host = parsedUrl.hostname.toLowerCase()

    if (!ALLOWED_YOUTUBE_HOSTS.includes(host)) {
      return false
    }

    if (host === 'youtu.be') {
      return parsedUrl.pathname.length > 1
    }

    if (host === 'youtube.com' || host === 'www.youtube.com') {
      return (
        parsedUrl.searchParams.has('v') ||
        parsedUrl.pathname.startsWith('/shorts/')
      )
    }

    return false
  } catch {
    return false
  }
}

const validatePublicationOwnership = async (
  publicacionId: number,
  usuarioId: number
) => {
  const publication = await findPublicationByIdRepository(publicacionId)

  if (!publication) {
    throw new Error('La publicación no existe')
  }

  if (publication.usuarioId !== usuarioId) {
    throw new Error('La publicación no pertenece al usuario autenticado')
  }

  return publication
}

export const getPublicationMultimediaService = async ({
  publicacionId,
  usuarioId
}: GetPublicationMultimediaInput) => {
  const publication = await validatePublicationOwnership(publicacionId, usuarioId)
  const multimedia = await getMultimediaByPublicationIdRepository(publicacionId)

  return {
    publication,
    multimedia
  }
}

export const registerVideoLinkService = async ({
  publicacionId,
  usuarioId,
  videoUrl
}: RegisterVideoLinkInput) => {
  const publication = await validatePublicationOwnership(publicacionId, usuarioId)

  const normalizedVideoUrl = videoUrl.trim()

  if (!normalizedVideoUrl) {
    throw new Error('El enlace de video es obligatorio')
  }

  if (!isValidYoutubeUrl(normalizedVideoUrl)) {
    throw new Error('Enlace de video no válido')
  }

  const totalVideos = await countMultimediaByPublicationIdAndTypeRepository(
    publicacionId,
    MULTIMEDIA_TYPES.VIDEO
  )

  if (totalVideos >= MAX_VIDEOS_PER_PUBLICATION) {
    throw new Error('Límite de videos alcanzado')
  }

  const newVideo = await createMultimediaRepository({
    publicacionId,
    tipo: MULTIMEDIA_TYPES.VIDEO,
    url: normalizedVideoUrl,
    pesoMb: null
  })

  return {
    publication,
    multimedia: newVideo
  }
}