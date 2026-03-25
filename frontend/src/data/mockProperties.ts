import { PropertyMapPin } from '@/types/property'

const TYPES = ['casa', 'departamento', 'terreno', 'local'] as const
const TITLES = [
  'Zona Norte',
  'Centro',
  'Queru Queru',
  'Sarco',
  'Cala Cala',
  'Alalay',
  'Mayorazgo',
  'Villa Coronilla',
  'Av. América',
  'Tiquipaya',
  'Quillacollo',
  'Sacaba'
]

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const MOCK_PROPERTIES: PropertyMapPin[] = Array.from({ length: 1000 }, (_, i) => {
  const latBase = -17.39
  const lngBase = -66.15

  return {
    id: `prop-${String(i + 1).padStart(3, '0')}`,
    lat: latBase + randomBetween(-0.08, 0.08),
    lng: lngBase + randomBetween(-0.08, 0.08),
    price: Math.floor(randomBetween(15000, 200000)),
    currency: 'USD',
    type: randomItem(TYPES),
    title: `${randomItem(TYPES)} en ${randomItem(TITLES)}`
  }
})
