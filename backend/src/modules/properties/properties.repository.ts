import { PrismaClient, Categoria, TipoAccion } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL no está definido en el entorno')

const adapter = new PrismaPg({ connectionString: databaseUrl })
const prisma = new PrismaClient({ adapter })

export interface FiltrosBusqueda {
  categoria?: string | string[]
  tipoInmueble?: string | string[]
  modoInmueble?: string | string[]
  query?: string
  fecha?: 'mas-recientes' | 'mas-populares' | 'mas-antiguos'
  precio?: 'menor-a-mayor' | 'mayor-a-menor'
  superficie?: 'menor-a-mayor' | 'mayor-a-menor'
}

export const propertiesRepository = {
  async getAll(filtros: FiltrosBusqueda = {}) {
    console.log('📦 Body de filtros recibido:', JSON.stringify(filtros, null, 2))
    // ── WHERE ──────────────────────────────────────────────────────────────
    const where: any = { estado: 'ACTIVO' }

    const rawTipo = filtros.tipoInmueble || filtros.categoria
    if (rawTipo) {
      const valor = Array.isArray(rawTipo) ? rawTipo[0] : rawTipo
      if (valor && valor !== 'Cualquier tipo') {
        where.categoria = valor.toUpperCase().trim()
      }
    }

    if (filtros.modoInmueble) {
      const valor = Array.isArray(filtros.modoInmueble)
        ? filtros.modoInmueble[0]
        : filtros.modoInmueble
      if (valor) {
        const modoLimpio = valor.toUpperCase().includes('ANTICR')
          ? 'ANTICRETO'
          : valor.toUpperCase()
        where.tipoAccion = modoLimpio
      }
    }

    if (filtros.query && filtros.query.trim() !== '') {
      const q = filtros.query.trim()

      where.OR = [
        { titulo: { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } },
        {
          // Filtramos por la zona directamente
          ubicacion: {
            zona: { contains: q, mode: 'insensitive' }
          }
        },
        {
          // Filtramos por el nombre de la ubicación maestra
          ubicacion: {
            ubicacion_maestra: {
              nombre: { contains: q, mode: 'insensitive' }
            }
          }
        }
      ]
    }
    console.log('🛠️ Objeto WHERE generado para Prisma:', JSON.stringify(where, null, 2))

    // ── ORDER BY ───────────────────────────────────────────────────────────
    // mas-populares: ordena por ubicacion → ubicacion_maestra → popularidad desc
    // Prisma soporta orderBy anidado siguiendo las relaciones del schema.
    // Los inmuebles sin ubicacion o sin ubicacion_maestra quedan al final
    // porque Prisma coloca nulls last por defecto en desc.
    //
    // Para precio y superficie: el frontend los maneja con criterioActivo,
    // así que el backend solo necesita proveer el default y popularidad.
    const orderBy: any[] = []

    if (filtros.precio === 'menor-a-mayor') {
      orderBy.push({ precio: 'asc' })
      orderBy.push({ id: 'asc' })
    } else if (filtros.precio === 'mayor-a-menor') {
      orderBy.push({ precio: 'desc' })
    } else if (filtros.superficie === 'menor-a-mayor') {
      orderBy.push({ superficieM2: 'asc' })
    } else if (filtros.superficie === 'mayor-a-menor') {
      orderBy.push({ superficieM2: 'desc' })
    } else if (filtros.fecha === 'mas-recientes') {
      orderBy.push({ fechaPublicacion: 'desc' })
    } else if (filtros.fecha === 'mas-antiguos') {
      orderBy.push({ fechaPublicacion: 'asc' })
    }

    orderBy.push({ id: 'asc' }) // Desempate default

    return prisma.inmueble.findMany({
      where,
      orderBy,
      include: {
        ubicacion: {
          include: {
            ubicacion_maestra: true // Vital para mostrar zonas de Cochabamba
          }
        },
        publicaciones: {
          where: { estado: 'ACTIVA' },
          include: { multimedia: true } // Para obtener las fotos reales
        }
      }
    })
  }
}
