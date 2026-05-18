// Tipo base que representa una propiedad visible en el mapa.
// Esta estructura debe coincidir con lo que devuelva el endpoint real

export type PropertyType =
  | 'casa'
  | 'departamento'
  | 'terreno'
  | 'oficina'
  | 'cuarto'
  | 'cementerio'
  | 'espacios'

export interface PropertyMapPin {
  id: string
  lat: number
  lng: number
  price: number
  currency: 'USD' | 'BOB'
  precioFormateado?: string
  type: PropertyType
  title: string
  descripcion?: string | null
  ubicacionTexto?: string | null
  categoriaTexto?: string | null
  accionTexto?: string | null
  thumbnailUrl?: string
  nroCuartos?: number | null
  nroBanos?: number | null
  superficieM2?: number | null
  score?: number
  razones?: string[]
   precio?: number           
  precio_anterior?: number | null  
  popularidad?: number      
}

// Respuesta esperada del endpoint real futuro:

export interface PropertiesMapResponse {
  data: PropertyMapPin[]
}
