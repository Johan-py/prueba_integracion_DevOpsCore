import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BannersRepository {
  async getActiveBanners() {
    return await prisma.bannerHome.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
    });
  }
}