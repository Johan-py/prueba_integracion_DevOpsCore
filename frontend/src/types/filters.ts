// -- BitPro
export type GlobalFilters = {
  locationId?: string | number
  tipoInmueble?: string[]
  modoInmueble?: string[]
  query?: string
  updatedAt: string
  // NUEVOS FILTROS GEOGRÁFICOS EN CASCADA
  departamentoId?: number
  provinciaId?: number
  municipioId?: number
  zonaId?: number
  barrioId?: number
  //HU6
  amenities?: number[]
  labels?: number[]
  lat?: number
  lng?: number
  radius?: number
}
