import { PrismaClient } from '@prisma/client';

// Forzamos a que Prisma sepa que NO estamos en un entorno Edge/Client
const prisma = new PrismaClient({
  __internal: {
    engine: {
      endpoint: process.env.DATABASE_URL
    }
  }
} as any); 

export default prisma;