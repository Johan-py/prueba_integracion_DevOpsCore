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