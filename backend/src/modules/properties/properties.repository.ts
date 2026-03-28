import { prisma } from '../../lib/prisma.js'
import type { PropertyMapPin } from './properties.types.js'

const categoriaToType: Record<string, PropertyMapPin['type']> = {
  CASA: 'casa',
  DEPARTAMENTO: 'departamento',
  TERRENO: 'terreno',
  OFICINA: 'local'
}

export const getPropertiesForMap = async (): Promise<PropertyMapPin[]> => {
  const inmuebles = await prisma.inmueble.findMany({
    where: {
      estado: 'ACTIVO',
      ubicacion: { isNot: null }
    },
    select: {
      id: true,
      titulo: true,
      precio: true,
      categoria: true,
      ubicacion: {
        select: {
          latitud: true,
          longitud: true
        }
      }
    }
  })

  return inmuebles
    .filter((i) => i.ubicacion !== null)
    .map((i) => ({
      id: String(i.id),
      title: i.titulo,
      price: Number(i.precio),
      currency: 'USD' as const,
      type: categoriaToType[i.categoria ?? ''] ?? 'casa',
      lat: Number(i.ubicacion!.latitud),
      lng: Number(i.ubicacion!.longitud)
    }))
}
