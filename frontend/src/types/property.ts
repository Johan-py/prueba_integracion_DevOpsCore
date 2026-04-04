// Tipo base que representa una propiedad visible en el mapa.
// Esta estructura debe coincidir con lo que devuelva el endpoint real

export type PropertyType = 'casa' | 'departamento' | 'terreno' | 'local'

export interface PropertyMapPin {
  id: string
  lat: number
  lng: number
  price: number
  currency: 'USD' | 'BOB'
  type: PropertyType
  title: string
  thumbnailUrl?: string
}

// Respuesta esperada del endpoint real futuro:

export interface PropertiesMapResponse {
  data: PropertyMapPin[]
}
