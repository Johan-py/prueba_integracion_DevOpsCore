import { PrismaClient, Categoria, TipoAccion } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL no está definido en el entorno')

const adapter = new PrismaPg({ connectionString: databaseUrl })
const prisma = new PrismaClient({ adapter })

type OrdenFecha = 'mas-recientes' | 'mas-populares' | 'mas-antiguos'
type OrdenDireccion = 'menor-a-mayor' | 'mayor-a-menor'

interface FiltrosBusqueda {
  categoria?: string | string[]
  tipoAccion?: string
  fecha?: OrdenFecha
  precio?: OrdenDireccion
  superficie?: OrdenDireccion
}

export const propertiesRepository = {
  async getAll(filtros: FiltrosBusqueda = {}) {
    // ── WHERE ──────────────────────────────────────────────────────────────
    const where: any = { estado: 'ACTIVO' }

    if (filtros.categoria) {
      const categoriasValidas: Categoria[] = ['CASA', 'DEPARTAMENTO', 'TERRENO', 'OFICINA']
      const entrada = Array.isArray(filtros.categoria) ? filtros.categoria : [filtros.categoria]
      const validas = entrada
        .map((c) => c.toUpperCase() as Categoria)
        .filter((c) => categoriasValidas.includes(c))
      if (validas.length > 0) {
        where.categoria = { in: validas }
      }
    }

    if (filtros.tipoAccion) {
      const tipoUpper = filtros.tipoAccion.toUpperCase() as TipoAccion
      const tiposValidos: TipoAccion[] = ['VENTA', 'ALQUILER', 'ANTICRETO']
      if (tiposValidos.includes(tipoUpper)) {
        where.tipoAccion = tipoUpper
      }
    }

    // ── ORDER BY ───────────────────────────────────────────────────────────
    // mas-populares: ordena por ubicacion → ubicacion_maestra → popularidad desc
    // Prisma soporta orderBy anidado siguiendo las relaciones del schema.
    // Los inmuebles sin ubicacion o sin ubicacion_maestra quedan al final
    // porque Prisma coloca nulls last por defecto en desc.
    //
    // Para precio y superficie: el frontend los maneja con criterioActivo,
    // así que el backend solo necesita proveer el default y popularidad.
    let orderBy: any[]

    if (filtros.fecha === 'mas-populares') {
      orderBy = [
        {
          ubicacion: {
            ubicacion_maestra: {
              popularidad: 'desc'
            }
          }
        },
        // Desempate: más recientes primero entre inmuebles de igual popularidad
        { fechaPublicacion: 'desc' }
      ]
    } else if (filtros.fecha === 'mas-antiguos') {
      orderBy = [{ fechaPublicacion: 'asc' }]
    } else {
      // default: mas-recientes
      orderBy = [{ fechaPublicacion: 'desc' }]
    }

    // ── QUERY ──────────────────────────────────────────────────────────────
    console.log('WHERE clause:', JSON.stringify(where))
    console.log('ORDER BY:', JSON.stringify(orderBy))

    return prisma.inmueble.findMany({
      where,
      orderBy,
      include: {
        ubicacion: {
          include: {
            // Necesario para que el orderBy por popularidad funcione
            // y para exponer el valor al frontend si lo necesita
            ubicacion_maestra: true
          }
        }
      }
    })
  }
}
