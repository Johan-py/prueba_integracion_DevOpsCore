import { $Enums } from '@prisma/client'
import { FiltersHomepageRepository } from './filtershomepage.repository.js'

export class FiltersHomepageService {
  private repository = new FiltersHomepageRepository()

  async getHomeFilters() {
    // 1. Obtenemos los datos del repositorio (que ya vienen mapeados y filtrados)
    const [rentalsRaw, salesRaw, categoriesRaw] = await Promise.all([
      this.repository.getCountsByCity($Enums.TipoAccion.ALQUILER),
      this.repository.getCountsByCity($Enums.TipoAccion.VENTA),
      this.repository.getCountsByCategoria()
    ])

    // 2. Función auxiliar simplificada
    // Ahora el repo envía { departamento: string, count: number }
    const mapToHomeFilter = (item: any) => ({
      name: item.departamento || 'Sin nombre',
      count: item.count
    })

    return {
      rentals: rentalsRaw.map(mapToHomeFilter),
      sales: salesRaw.map(mapToHomeFilter),
      categories: categoriesRaw.map((c: any) => ({
        // Para categorías, el repo usa groupBy, así que mantenemos _count.id
        name: c.categoria || 'Otros',
        count: c._count.id
      }))
    }
  }
}