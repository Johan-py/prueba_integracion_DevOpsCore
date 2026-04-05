import { defineConfig } from "@prisma/config";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
//Feature/Cobros_dentro_la_plataforma

export default defineConfig({
  schema: 'prisma/schema.prisma', 
  migrations: {
    seed: "bun ./prisma/seed.ts",
  },
  datasource: {
<<<<<<< HEAD
    url: process.env.DATABASE_URL
  }
})
  
    

=======
    url: process.env.DATABASE_URL,
  },
});
>>>>>>> b68a39aab8d9cda89a4ae3b8e3d1069c14f8933f
