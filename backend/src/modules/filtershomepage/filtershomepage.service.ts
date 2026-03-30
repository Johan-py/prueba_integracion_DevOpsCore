import { $Enums } from '@prisma/client'
import { FiltersHomepageRepository } from './filtershomepage.repository.js'

export class FiltersHomepageService {
  private repository = new FiltersHomepageRepository()

  async getHomeFilters() {
    // 1. Usamos los Enums reales: $Enums.TipoAccion.ALQUILER y VENTA
    // 2. Cambiamos getCountsByType por getCountsByCategoria (según tu Schema)
    const [rentalsRaw, salesRaw, categoriesRaw] = await Promise.all([
      this.repository.getCountsByCity($Enums.TipoAccion.ALQUILER),
      this.repository.getCountsByCity($Enums.TipoAccion.VENTA),
      this.repository.getCountsByCategoria()
    ])

    return {
      // TypeScript ahora sabrá que 'r', 's' y 'c' tienen la estructura de Prisma
      rentals: rentalsRaw.map((r) => ({
        name: r.ciudad,
        count: r._count.id
      })),
      sales: salesRaw.map((s) => ({
        name: s.ciudad,
        count: s._count.id
      })),
      categories: categoriesRaw.map((c) => ({
        name: c.categoria || 'Otros', // 'categoria' puede ser null en tu Schema
        count: c._count.id
      }))
    }
  }
}
