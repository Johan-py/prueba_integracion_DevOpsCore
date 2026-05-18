export interface InmuebleConScore {
  id: number
  titulo: string
  precio: number
  superficieM2: number | null
  categoria: string | null
  ubicacion: {
    zona: string | null
    ciudad: string | null
  } | null
  score: number
  razones: string[] // Para debugging
  modeloUsado?: 'ML' | 'REGLAS'
}

export interface HistorialVista {
  inmuebleId: number
  vistaEn: Date
  peso: number // 1.0 para últimos 7 días, menor para más antiguos
}

export interface PreferenciasUsuario {
  zonasPreferidas: Map<string, number> // zona -> peso
  categoriasPreferidas: Map<string, number> // categoria -> peso
  rangoPrecio: { min: number; max: number } | null
  rangoSuperficie: { min: number; max: number } | null
  ultimasBusquedas: string[]
  totalClics: number
}

export interface RecomendacionesParams {
  usuarioId?: number
  limit?: number
  excludeIds?: number[] // Inmuebles a excluir
  zonaForzada?: string // Para forzar 60% de una zona
  ia?: boolean // Si es true, activa modo avanzado con IA (similitud de coseno)
  modoInmueble?: string[]
  query?: string
  minPrice?: number
  maxPrice?: number
  minSuperficie?: number
  maxSuperficie?: number
  dormitoriosMin?: number
  dormitoriosMax?: number
  banosMin?: number
  banosMax?: number
  amenities?: string[]
  labels?: string[]
  tipoInmueble?: string
}
export interface ReglasAvanzadasConfig {
  umbralClicsRecomendacionAvanzada: number // 5 por defecto: activa modo avanzado
  pesoFavoritoSimilar: number // 15 por defecto
  pesoZonaConexion: number // 10 por defecto
  pesoSimilaridadFuerte: number // 20 por defecto: bono por 3/4 coincidencias
}

export interface SimilaridadFuerte {
  mismaZona: boolean
  mismaCategoria: boolean
  rangoPrecioCercano: boolean // precio dentro del ±20% respecto a un favorito
  rangoSuperficieCercano: boolean // superficie dentro del ±20% respecto a un favorito
}
