import { defineConfig } from '@prisma/config'
import * as dotenv from 'dotenv'
import path from 'path'

// Cargar .env desde la raíz del backend
dotenv.config({ path: path.join(__dirname, '.env') })

export default defineConfig({
  migrations: {
    seed: 'bun ./prisma/seed.ts'
  },
  datasource: {
    url: process.env.DATABASE_URL
  }
})
