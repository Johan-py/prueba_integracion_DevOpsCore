import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

// Cargar .env de forma robusta para Bun/Node
dotenv.config({ path: path.join((import.meta as any).dir, '../../.env') })

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL no encontrada en el entorno')
}

const prisma = new PrismaClient()

export default prisma
