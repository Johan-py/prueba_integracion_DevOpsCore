import { Inmueble } from '../../types/inmueble'

export const mockInmuebles: Inmueble[] = [
  {
    id: 1,
    titulo: 'Villa con Jardín',
    precio: 120000,
    superficie: 110,
    ubicacion: 'Tiquipaya, El Paso',
    habitaciones: 2,
    banos: 2,
    fechaPublicacion: '2026-03-20',
    popularidad: 95
  },
  {
    id: 2,
    titulo: 'Departamento Moderno',
    precio: 85000,
    superficie: 75,
    ubicacion: 'Cochabamba, Centro',
    habitaciones: 1,
    banos: 1,
    fechaPublicacion: '2026-03-25',
    popularidad: 40
  },
  {
    id: 3,
    titulo: 'Casa Familiar',
    precio: 200000,
    superficie: 200,
    ubicacion: 'Sacaba, Zona Norte',
    habitaciones: 4,
    banos: 3,
    fechaPublicacion: '2026-01-10',
    popularidad: 78
  },
  {
    id: 4,
    titulo: 'Loft Ejecutivo',
    precio: 65000,
    superficie: 50,
    ubicacion: 'Cochabamba, Recoleta',
    habitaciones: 1,
    banos: 1,
    fechaPublicacion: '2026-02-15',
    popularidad: 60
  },
  {
    id: 5,
    titulo: 'Quinta Privada',
    precio: 350000,
    superficie: 500,
    ubicacion: 'Colcapirhua',
    habitaciones: 5,
    banos: 4,
    fechaPublicacion: '2025-12-01',
    popularidad: 88
  }
]
