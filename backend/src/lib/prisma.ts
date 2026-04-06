import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined')
}

const adapter = new PrismaPg({ connectionString })

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
