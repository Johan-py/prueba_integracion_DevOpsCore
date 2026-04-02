// frontend/src/lib/mock/inmuebles.mock.ts

// 1. Definimos el contrato localmente para evitar el error de importación circular
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

// 2. Usamos la interfaz local para los datos de prueba
export const inmueblesMock: PropertyMapPin[] = [
  {
    id: '1',
    lat: -17.371,
    lng: -66.151,
    price: 85000,
    currency: 'USD',
    type: 'departamento',
    title: 'Hermoso Departamento en Cala Cala',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
  },
  {
    id: '2',
    lat: -21.535,
    lng: -64.729,
    price: 150000,
    currency: 'USD',
    type: 'casa',
    title: 'Casa Moderna en El Molino',
    thumbnailUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914'
  },
  {
    id: '3',
    lat: -17.398,
    lng: -66.146,
    price: 2400,
    currency: 'BOB',
    type: 'departamento',
    title: 'Garzonier Económico Las Cuadras',
    thumbnailUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'
  },
  {
    id: '4',
    lat: -17.783,
    lng: -63.181,
    price: 500,
    currency: 'USD',
    type: 'local',
    title: 'Oficina Central Santa Cruz',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c'
  },
  {
    id: '5',
    lat: -17.391,
    lng: -66.076,
    price: 45000,
    currency: 'USD',
    type: 'terreno',
    title: 'Terreno Amplio en Sacaba',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef'
  }
]
