import { Inmueble } from '../../types/inmueble'

export const mockInmuebles: Inmueble[] = [
  {
    id: 1,
    titulo: 'Villa con Jardín',
    precio: 120000,
    superficieM2: 110,
    ubicacion: { ciudad: 'Cochabamba', zona: 'Tiquipaya, El Paso' },
    nroCuartos: 2,
    nroBanos: 2,
    fechaPublicacion: '2026-03-20',
    popularidad: 95
  },
  {
    id: 2,
    titulo: 'Departamento Moderno',
    precio: 85000,
    superficieM2: 75,
    ubicacion: { ciudad: 'Cochabamba', zona: 'Centro' },
    nroCuartos: 1,
    nroBanos: 1,
    fechaPublicacion: '2026-03-25',
    popularidad: 40
  },
  {
    id: 3,
    titulo: 'Casa Familiar',
    precio: 200000,
    superficieM2: 200,
    ubicacion: { ciudad: 'Cochabamba', zona: 'Sacaba, Zona Norte' },
    nroCuartos: 4,
    nroBanos: 3,
    fechaPublicacion: '2026-01-10',
    popularidad: 78
  },
  {
    id: 4,
    titulo: 'Loft Ejecutivo',
    precio: 65000,
    superficieM2: 50,
    ubicacion: { ciudad: 'Cochabamba', zona: 'Recoleta' },
    nroCuartos: 1,
    nroBanos: 1,
    fechaPublicacion: '2026-02-15',
    popularidad: 60
  },
  {
    id: 5,
    titulo: 'Quinta Privada',
    precio: 350000,
    superficieM2: 500,
    ubicacion: { ciudad: 'Cochabamba', zona: 'Colcapirhua' },
    nroCuartos: 5,
    nroBanos: 4,
    fechaPublicacion: '2025-12-01',
    popularidad: 88
  }
]
