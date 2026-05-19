export interface DetallePropiedad {
  id: number
  inmuebleId: number
  titulo: string
  precio: number
  precio_anterior?: number
  tipoInmueble: string | null
  tipoOperacion: string
  ubicacionTexto: string
  descripcion: string
  imagenes: Array<{
    id: number
    url: string
    tipo: string
    pesoMb: number | null
  }>
  detalles: {
    habitaciones: number | null
    banos: number | null
    superficieUtil: number | null
  }
  caracteristicasAdicionales: string[]
  mapa: {
    latitud: number | null
    longitud: number | null
    direccion: string | null
  }
  puntosDeInteres?: PuntoInteres[]
  contacto: {
    nombre: string
    correo: string | null
    telefono: string | null
  }
}

export interface PuntoInteres {
  id: number
  nombre: string
  latitud: number
  longitud: number
}
