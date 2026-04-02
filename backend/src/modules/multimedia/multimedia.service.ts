import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_YOUTUBE_HOSTS,
  MAX_IMAGE_SIZE_MB,
  MAX_IMAGES_PER_PUBLICATION,
  MAX_VIDEOS_PER_PUBLICATION,
  MULTIMEDIA_TYPES
} from './multimedia.constants.js'
import {
  countMultimediaByPublicationIdAndTypeRepository,
  createMultimediaRepository,
  findPublicationByIdRepository,
  getMultimediaByPublicationIdRepository
} from './multimedia.repository.js'
import type {
  GetPublicationMultimediaInput,
  RegisterImagesInput,
  RegisterVideoLinkInput
} from './multimedia.types.js'

const validatePositiveInteger = (value: number, fieldName: string) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${fieldName} no válido`)
  }
}

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
      return parsedUrl.searchParams.has('v') || parsedUrl.pathname.startsWith('/shorts/')
    }

    return false
  } catch {
    return false
  }
}

const validatePublicationOwnership = async (publicacionId: number, usuarioId: number) => {
  validatePositiveInteger(publicacionId, 'ID de publicación')
  validatePositiveInteger(usuarioId, 'Usuario')

  const publication = await findPublicationByIdRepository(publicacionId)

  if (!publication) {
    throw new Error('La publicación no existe')
  }

  if (publication.usuarioId !== usuarioId) {
    throw new Error('La publicación no pertenece al usuario autenticado')
  }

  return publication
}

const validateImagesInput = (images: RegisterImagesInput['images']) => {
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error('Debe enviar al menos una imagen')
  }

  if (images.length > MAX_IMAGES_PER_PUBLICATION) {
    throw new Error('Límite de imágenes alcanzado')
  }

  images.forEach((image, index) => {
    const imageIndex = index + 1

    if (!image || typeof image !== 'object') {
      throw new Error(`La imagen ${imageIndex} no es válida`)
    }

    if (typeof image.url !== 'string' || !image.url.trim()) {
      throw new Error(`La URL de la imagen ${imageIndex} es obligatoria`)
    }

    if (typeof image.extension !== 'string' || !image.extension.trim()) {
      throw new Error(`La extensión de la imagen ${imageIndex} es obligatoria`)
    }

    const normalizedExtension = image.extension.trim().toLowerCase()

    if (!ALLOWED_IMAGE_EXTENSIONS.includes(normalizedExtension)) {
      throw new Error('Formato no permitido. Solo PNG, JPG o JPEG')
    }

    if (typeof image.pesoMb !== 'number' || Number.isNaN(image.pesoMb) || image.pesoMb <= 0) {
      throw new Error(`El tamaño de la imagen ${imageIndex} no es válido`)
    }

    if (image.pesoMb > MAX_IMAGE_SIZE_MB) {
      throw new Error('La imagen supera el tamaño máximo permitido de 5 MB')
    }
  })
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

  if (typeof videoUrl !== 'string' || !videoUrl.trim()) {
    throw new Error('El enlace de video es obligatorio')
  }

  const normalizedVideoUrl = videoUrl.trim()

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

export const registerImagesService = async ({
  publicacionId,
  usuarioId,
  images
}: RegisterImagesInput) => {
  const publication = await validatePublicationOwnership(publicacionId, usuarioId)

  validateImagesInput(images)

  const totalImages = await countMultimediaByPublicationIdAndTypeRepository(
    publicacionId,
    MULTIMEDIA_TYPES.IMAGE
  )

  if (totalImages + images.length > MAX_IMAGES_PER_PUBLICATION) {
    throw new Error('Límite de imágenes alcanzado')
  }

  const createdImages = await Promise.all(
    images.map((image) =>
      createMultimediaRepository({
        publicacionId,
        tipo: MULTIMEDIA_TYPES.IMAGE,
        url: image.url.trim(),
        pesoMb: image.pesoMb
      })
    )
  )

  return {
    publication,
    multimedia: createdImages
  }
}
