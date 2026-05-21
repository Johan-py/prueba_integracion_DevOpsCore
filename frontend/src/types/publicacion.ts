export interface MisPublicacionesItem {
  id: number;
  titulo: string;
  precio: number;
  ubicacion: string;
  nroBanos: number | null;
  nroCuartos: number | null;
  superficieM2: number | null;
  imagenUrl: string | null;
  tipoOperacion?: string;
  activa?: boolean;
  promoted?: boolean;

  // Estadísticas de la publicación
  totalVisualizaciones?: number;
  totalCompartidos?: number;

  metricas?: {
    visitas: number;
    favoritos: number;
    contactos: number;
  };
}

export interface FormPublicar {
  titulo: string;
  tipoPropiedad: string;
  precio: string;
  superficie: string;
  habitaciones: string;
  banos: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  descripcion: string;
}

export interface ErrorValidacion {
  campo: keyof FormPublicar;
  seccion: "Información Básica" | "Características" | "Ubicación" | "Detalles";
  mensaje: string;
}

export type EstadoPublicacion =
  | "idle"
  | "validando"
  | "errores"
  | "confirmando"
  | "publicando"
  | "exito"
  | "error_publicacion";

export interface PublicacionImagen {
  id: number;
  url: string;
  tipo: string;
  pesoMb: number | null;
}

export interface PublicacionDetalle {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  tipoOperacion: "VENTA" | "ALQUILER" | "ANTICRETO";
  ubicacionTexto: string;
  imagenes: PublicacionImagen[];
  videoUrl?: string | null;
  videoUrls?: string[];
}

export interface EditarPublicacionPayload {
  titulo: string;
  descripcion: string;
  precio: number;
  tipoAccion: "VENTA" | "ALQUILER" | "ANTICRETO";
  ubicacion: string;
}

// ==================== NUEVOS TIPOS HU-11 ====================
// PUBLICIDAD DE PROPIEDADES

export interface EstadoPublicidad {
  id: number;
  promoted: boolean;
  promotedAt: Date | null;
  promotedExpiresAt: Date | null;
}

export interface PromocionarResponse {
  checkoutUrl: string;
}