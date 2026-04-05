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
    try {
      // Si la query es muy corta, devolvemos vacío para evitar carga innecesaria
      if (!query || query.length < 2) return []

      return await prisma.ubicacion_maestra.findMany({
        where: {
          OR: [
            // 'nombre' es la ZONA en tu base de datos
            { nombre: { contains: query, mode: 'insensitive' } },
            { municipio: { contains: query, mode: 'insensitive' } },
            { departamento: { contains: query, mode: 'insensitive' } }
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
    } catch (error) {
      console.error('❌ Error en LocationsRepository.findByName:', error)
      // Devolvemos un array vacío para que el frontend no reciba el 500
      return []
    }
  }

  /**
   * Incrementa la popularidad de una zona cuando el usuario la selecciona.
   */
  async incrementPopularity(id: number) {
    try {
      return await prisma.ubicacion_maestra.update({
        where: { id: id },
        data: {
          popularidad: { increment: 1 }
        }
      })
    } catch (error) {
      console.error('❌ Error al incrementar popularidad:', error)
      return null
    }
  }
}
