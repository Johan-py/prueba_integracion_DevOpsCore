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

export interface PropertiesMapResponse {
  data: PropertyMapPin[]
}
