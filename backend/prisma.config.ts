import { defineConfig, env } from 'prisma/config'
import * as dotenv from 'dotenv'
import path from 'path'

export default defineConfig({
  migrations: {
    seed: 'bun ./prisma/seed.ts'
  },
  datasource: {
    url: env('DATABASE_URL')
  }
})
