import {
  deleteMultimediaService,
  getPublicationMultimediaService,
  publishPublicationService,
  registerVideoFileService,
  registerVideoLinkService
} from './multimedia.service.js'

export const getPublicationMultimediaController = async ({
  id_publicacion,
  usuario_id
}: {
  id_publicacion: number
  usuario_id: number
}) => {
  return getPublicationMultimediaService({
  publicacionId: id_publicacion,
  usuarioId: usuario_id
})
}

export const registerVideoLinkController = async ({
  id_publicacion,
  usuario_id,
  videoUrl
}: {
  id_publicacion: number
  usuario_id: number
  videoUrl: string
}) => {
  return registerVideoLinkService({
  publicacionId: id_publicacion,
  usuarioId: usuario_id,
  videoUrl
})
}

// ✅ TAREA 4
export const registerVideoFileController = async ({
  id_publicacion,
  usuario_id,
  url,
  formato,
  peso_mb
}: {
  id_publicacion: number
  usuario_id: number
  url: string
  formato: string
  peso_mb: number
}) => {
  return registerVideoFileService({ id_publicacion, usuario_id, url, formato, peso_mb })
}

// ✅ TAREA 5
export const deleteMultimediaController = async ({
  id_multimedia,
  usuario_id
}: {
  id_multimedia: number
  usuario_id: number
}) => {
  return deleteMultimediaService({
  multimediaId: id_multimedia,
  usuarioId: usuario_id
})
}
// ✅ TAREA 6
export const publishPublicationController = async ({
  id_publicacion,
  usuario_id,
  confirmacion_publicacion
}: {
  id_publicacion: number
  usuario_id: number
  confirmacion_publicacion: boolean
}) => {
  return publishPublicationService({
  publicacionId: id_publicacion,
  usuarioId: usuario_id,
  confirmacionPublicacion: confirmacion_publicacion
})
}