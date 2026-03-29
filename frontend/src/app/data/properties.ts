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
  },
  {
    id: '3',
    title: 'Terreno amplio',
    price: 50000,
    type: 'terreno',
    operation: 'venta',
    rooms: 0,
    bathrooms: 0,
    lat: -17.37,
    lng: -66.17
  },
  {
    id: '4',
    title: 'Local comercial',
    price: 120000,
    type: 'local',
    operation: 'anticretico',
    rooms: 1,
    bathrooms: 1,
    lat: -17.4,
    lng: -66.14
  }
]
