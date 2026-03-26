import {
  createMultimediaRepository,
  findPublicationById,
  getMultimediaByPublicationId,
  countMultimediaByPublicationIdAndType
} from './multimedia.repository.js'

const MULTIMEDIA_TYPES = {
  IMAGE: 1,
  VIDEO: 2
}

const MAX_VIDEOS_PER_PUBLICATION = 2
const ALLOWED_YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'youtu.be']

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

export const getPublicationMultimediaService = async ({
  id_publicacion,
  usuario_id
}: {
  id_publicacion: number
  usuario_id: number
}) => {
  const publication = await findPublicationById(id_publicacion)

  if (!publication) {
    throw new Error('La publicación no existe')
  }

  if (publication.usuario_id !== usuario_id) {
    throw new Error('La publicación no pertenece al usuario autenticado')
  }

  const multimedia = await getMultimediaByPublicationId(id_publicacion)

  return {
    publication,
    multimedia
  }
}

export const registerVideoLinkService = async ({
  id_publicacion,
  usuario_id,
  videoUrl
}: {
  id_publicacion: number
  usuario_id: number
  videoUrl: string
}) => {
  const publication = await findPublicationById(id_publicacion)

  if (!publication) {
    throw new Error('La publicación no existe')
  }

  if (publication.usuario_id !== usuario_id) {
    throw new Error('La publicación no pertenece al usuario autenticado')
  }

  const normalizedVideoUrl = videoUrl?.trim()

  if (!normalizedVideoUrl) {
    throw new Error('El enlace de video es obligatorio')
  }

  if (!isValidYoutubeUrl(normalizedVideoUrl)) {
    throw new Error('Enlace de video no válido')
  }

  const totalVideos = await countMultimediaByPublicationIdAndType(
    id_publicacion,
    MULTIMEDIA_TYPES.VIDEO
  )

  if (totalVideos >= MAX_VIDEOS_PER_PUBLICATION) {
    throw new Error('Límite de videos alcanzado')
  }

  const newVideo = await createMultimediaRepository({
    id_publicacion,
    id_tipo: MULTIMEDIA_TYPES.VIDEO,
    url: normalizedVideoUrl,
    formato: 'youtube',
    peso_mb: 0
  })

  return {
    publication,
    multimedia: newVideo
  }
}