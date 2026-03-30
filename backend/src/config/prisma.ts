import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// 1. Configurar el pool de conexión a PostgreSQL (Neon)
const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })

// 2. Crear el adaptador
const adapter = new PrismaPg(pool)

// 3. Instanciar el cliente pasando el adaptador
export const prisma = new PrismaClient({ adapter })

// --- AÑADE ESTO AQUÍ ABAJO ---
export default prisma
