// backend/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL

// Configuramos el Pool de conexiones de forma global
const pool = new Pool({ 
  connectionString,
  max: 1 // Limitamos a 1 conexión por instancia para no saturar Supabase
})
const adapter = new PrismaPg(pool)

// Evitamos crear múltiples instancias en desarrollo (Hot Reload)
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
