import { $Enums } from "@prisma/client";
import { FiltersHomepageRepository } from "./filtershomepage.repository.js";

export class FiltersHomepageService {
  private repository = new FiltersHomepageRepository();

  async getHomeFilters() {
    // 1. Usamos los Enums reales: $Enums.TipoAccion.ALQUILER y VENTA
    // 2. Cambiamos getCountsByType por getCountsByCategoria (según tu Schema)
    const [rentalsRaw, salesRaw, categoriesRaw] = await Promise.all([
      this.repository.getCountsByCity($Enums.TipoAccion.ALQUILER),
      this.repository.getCountsByCity($Enums.TipoAccion.VENTA),
      this.repository.getCountsByCategoria(),
    ]);
    // Función auxiliar para evitar repetir lógica y manejar el tipado
    const mapToHomeFilter = (item: any) => ({
      // Si el repo ya trae el nombre por un Join, lo usamos. 
      // Si no, usamos el ID o un placeholder hasta que el repo incluya el nombre.
      name: item.ubicacionMaestra?.nombre || item.ciudad || `Zona ${item.ubicacionMaestraId}`, 
      count: item._count.id,
    });
    return {
      rentals: rentalsRaw.map(mapToHomeFilter),
      sales: salesRaw.map(mapToHomeFilter),
      categories: categoriesRaw.map((c: any) => ({
        name: c.categoria || "Otros",
        count: c._count.id,
      })),
    };
  }
}
