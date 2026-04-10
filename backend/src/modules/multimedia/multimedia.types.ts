export type MultimediaType = 'IMAGEN' | 'VIDEO'

export interface MultimediaRecord {
  id: number
  publicacionId: number
  tipo: MultimediaType
  url: string
  pesoMb: number | null
}

export interface PublicacionRecord {
  id: number
  usuarioId: number
  titulo: string
}

export interface GetPublicationMultimediaInput {
  publicacionId: number
  usuarioId: number
}

export interface RegisterVideoLinkInput {
  publicacionId: number
  usuarioId: number
  videoUrl: string
}

export interface ImageUploadItemInput {
  url: string
  extension: string
  pesoMb: number
}

export interface RegisterImagesInput {
  publicacionId: number
  usuarioId: number
  images: ImageUploadItemInput[]
}

export interface RegisterVideoLinkBody {
  videoUrl: string
}

export interface RegisterImagesBody {
  images: ImageUploadItemInput[]
}
