export interface PropertyMapPin {
  id: string
  title: string
  price: number
  type: 'casa' | 'departamento' | 'terreno' | 'local'
  operation: 'venta' | 'alquiler' | 'anticretico'
  rooms: number
  bathrooms: number
  lat: number
  lng: number
}
export const mockProperties: PropertyMapPin[] = [
  {
    id: '1',
    title: 'Casa moderna',
    price: 80000,
    type: 'casa',
    operation: 'venta',
    rooms: 3,
    bathrooms: 2,
    lat: -17.38,
    lng: -66.16
  },
  {
    id: '2',
    title: 'Departamento céntrico',
    price: 65000,
    type: 'departamento',
    operation: 'alquiler',
    rooms: 2,
    bathrooms: 1,
    lat: -17.39,
    lng: -66.15
  }
]
