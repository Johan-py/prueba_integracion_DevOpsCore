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
<<<<<<< HEAD

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
=======

    const mapToHomeFilter = (item: any) => ({
      name: item.departamento || 'Sin nombre',
      count: item.count
    })

    return {
      rentals: rentalsRaw.map(mapToHomeFilter),
      sales: salesRaw.map(mapToHomeFilter),
      categories: categoriesRaw.map((c: any) => ({
        name: c.categoria || 'Otros',
>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5
        count: c._count.id
      }))
    }
  }
}
