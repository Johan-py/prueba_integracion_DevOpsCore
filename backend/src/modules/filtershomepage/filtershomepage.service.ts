import { $Enums } from '@prisma/client'
import { FiltersHomepageRepository } from './filtershomepage.repository.js'

export class FiltersHomepageService {
  private repository = new FiltersHomepageRepository()

  async getHomeFilters() {
    const [rentalsRaw, salesRaw, categoriesRaw] = await Promise.all([
      this.repository.getCountsByCity($Enums.TipoAccion.ALQUILER),
      this.repository.getCountsByCity($Enums.TipoAccion.VENTA),
      this.repository.getCountsByCategoria()
    ])

    const mapToHomeFilter = (item: any) => ({
      name: item.departamento || 'Sin nombre',
      count: item.count
    })

    return {
      rentals: rentalsRaw.map(mapToHomeFilter),
      sales: salesRaw.map(mapToHomeFilter),
      categories: categoriesRaw.map((c: any) => ({
        name: c.categoria || 'Otros',
        count: c._count.id
      }))
    }
  }
}
