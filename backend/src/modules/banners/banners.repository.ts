import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Configura el pool de PostgreSQL y el adaptador de Prisma
const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// Se pasa el adaptador a PrismaClient
const prisma = new PrismaClient({ adapter })

export class BannersRepository {
  async getActiveBanners() {
    return await prisma.bannerHome.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' }
    })
  }
}
