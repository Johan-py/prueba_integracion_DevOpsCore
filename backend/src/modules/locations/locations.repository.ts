import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export class LocationsRepository {
  async findByName(query: string) {
    return await prisma.ubicacion_maestra.findMany({
      where: {
        nombre: { contains: query, mode: 'insensitive' },
      },
      select: {
        id: true,
        nombre: true,
        departamento: true,
      },
      orderBy: { popularidad: 'desc' },
      take: 5,
    });
  }
}