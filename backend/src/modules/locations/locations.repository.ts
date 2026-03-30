import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export class LocationsRepository {
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
}
