import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: 'prisma/schema.prisma', 
  migrations: {
    seed: "bun ./prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,

  },
});