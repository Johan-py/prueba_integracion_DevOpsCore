<<<<<<< HEAD
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Configura el pool de PostgreSQL y el adaptador de Prisma
const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// Se pasa el adaptador a PrismaClient
const prisma = new PrismaClient({ adapter })

=======
import { prisma } from '../../db.js'
>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5
export class BannersRepository {
  async getActiveBanners() {
    // Se utiliza la instancia global del archivo db.ts para ejecutar la consulta a la base de datos.
    return await prisma.bannerHome.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' }
    })
  }
}
