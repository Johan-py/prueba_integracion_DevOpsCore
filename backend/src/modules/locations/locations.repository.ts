import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export class LocationsRepository {
  // Función auxiliar para generar variaciones con tildes (RegEx simple) --BitPro
  private normalizeQuery(query: string) {
    return query
      .replace(/[aá]/gi, '[aá]')
      .replace(/[eé]/gi, '[eé]')
      .replace(/[ií]/gi, '[ií]')
      .replace(/[oó]/gi, '[oó]')
      .replace(/[uú]/gi, '[uú]')
  }
  async findByName(query: string) {
    return await prisma.ubicacion_maestra.findMany({
      where: {
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } }, //Esta es la zona porsiacaso en la bd esta como nombre
          { municipio: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        nombre: true,
        municipio: true,
        departamento: true
      },
      orderBy: { popularidad: 'desc' },
      take: 5
    })
  }

  async incrementPopularity(id: number) {
    return await prisma.ubicacion_maestra.update({
      where: { id: id },
      data: {
        popularidad: {
          increment: 1
        }
      }
    })
  }
}
