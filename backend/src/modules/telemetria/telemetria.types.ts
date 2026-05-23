export interface SearchTelemetriaData {
  tipoInmueble?: string[]
  modoInmueble?: string[]
  query?: string
  zona?: string
  precioMin?: number
  precioMax?: number
  superficieMin?: number
  superficieMax?: number
  fechaBusqueda?: Date
}

export interface ClickTelemetriaData {
  inmueble_id: number
  posicionLista?: number
  filtrosAplicados?: any
}

