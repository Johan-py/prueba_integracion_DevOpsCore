import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL no está definido en el entorno')
}

const adapter = new PrismaPg({ connectionString: databaseUrl })
const prisma = new PrismaClient({ adapter })
type OrdenFecha = 'mas-recientes' | 'mas-populares'
type OrdenDireccion = 'menor-a-mayor' | 'mayor-a-menor'

interface FiltrosOrdenamiento {
  fecha?: OrdenFecha
  precio?: OrdenDireccion
  superficie?: OrdenDireccion
}

export const propertiesRepository = {
  async getAll(orden: FiltrosOrdenamiento = {}) {
    const orderBy: any[] = []

    if (orden.fecha === 'mas-recientes' || !orden.fecha) {
      orderBy.push({ fechaPublicacion: 'desc' })
    }

    if (orden.precio) {
      orderBy.push({
        precio: orden.precio === 'menor-a-mayor' ? 'asc' : 'desc'
      })
    }

    if (orden.superficie) {
      orderBy.push({
        superficieM2: orden.superficie === 'menor-a-mayor' ? 'asc' : 'desc'
      })
    }

    return prisma.inmueble.findMany({
      where: { estado: 'ACTIVO' },
      orderBy,
      include: {
        ubicacion: true
      }
    })
  }
}
