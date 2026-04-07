import { prisma } from '../../lib/prisma.config.ts'
export class BannersRepository {
  async getActiveBanners() {
    // Se utiliza la instancia global del archivo db.ts para ejecutar la consulta a la base de datos.
    return await prisma.bannerHome.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
    });
  }
}
