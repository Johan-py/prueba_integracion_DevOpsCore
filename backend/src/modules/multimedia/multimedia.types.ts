export type MultimediaType = "IMAGEN" | "VIDEO";

export interface MultimediaRecord {
  id: number;
  publicacion_id: number;
  tipo: MultimediaType;
  url: string;
  peso_mb: number | null;
}

export interface PublicacionRecord {
  id: number;
  usuario_id: number;
  titulo: string;
}

export interface GetPublicationMultimediaInput {
  publicacion_id: number;
  usuario_id: number;
}

export interface RegisterVideoLinkInput {
  publicacion_id: number;
  usuario_id: number;
  videoUrl: string;
}

export interface ImageUploadItemInput {
  url: string;
  extension: string;
  peso_mb: number;
}

export interface RegisterImagesInput {
  publicacion_id: number;
  usuario_id: number;
  images: ImageUploadItemInput[];
}

export interface RegisterVideoLinkBody {
  videoUrl: string;
}

export interface RegisterImagesBody {
  images: ImageUploadItemInput[];
}
