import { $Enums } from "@prisma/client";
import { FiltersHomepageRepository } from "./filtershomepage.repository.js";

export class FiltersHomepageService {
  private repository = new FiltersHomepageRepository();

  async getHomeFilters() {
    const [rentalsRaw, salesRaw, categoriesRaw] = await Promise.all([
      this.repository.getCountsByCity($Enums.TipoAccion.ALQUILER),
      this.repository.getCountsByCity($Enums.TipoAccion.VENTA),
      this.repository.getCountsByCategoria(),
    ]);

    const mapToHomeFilter = (item: {
      departamento: string;
      count: number;
      previews: Array<{ imagen: string; titulo: string }>;
    }) => ({
      name: item.departamento || "Sin nombre",
      count: item.count,
      previews: item.previews ?? [],
    });

    const requiredCategories = [
      { id: "CASA", label: "Casa" },
      { id: "DEPARTAMENTO", label: "Departamento" },
      { id: "OFICINA", label: "Oficina" },
      { id: "TERRENO", label: "Terreno" },
      { id: "CEMENTERIO", label: "Cementerio" },
      { id: "CUARTO", label: "cuarto" },
    ];

    const categoriesMapped = requiredCategories.map((reqCat) => {
      const found = categoriesRaw.find(
        (c: { categoria: string | null; _count: { id: number } }) =>
          c.categoria === reqCat.id,
      );
      return {
        name: reqCat.label,
        count: found ? found._count.id : 0,
      };
    });

    return {
      rentals: rentalsRaw.map(mapToHomeFilter),
      sales: salesRaw.map(mapToHomeFilter),
      categories: categoriesMapped,
    };
  }
}
