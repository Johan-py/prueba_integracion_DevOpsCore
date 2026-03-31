import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'
import path from 'path'

// Cargar .env desde la raíz del backend
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
//Feature/Cobros_dentro_la_plataforma

export default defineConfig({
  migrations: {
    seed: "bun ./prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
