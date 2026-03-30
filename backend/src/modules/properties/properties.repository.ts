//import { PropertyFilters, Property } from "./properties.types.js";
import type { PropertyFilters, Property } from "./properties.types.js";

class PropertyRepository {
  async findWithFilters(filters: PropertyFilters): Promise<Property[]> {
    return [
      {
        id: 1,
        categoria: filters.categoria ?? "casa",
        tipoAccion: filters.tipoAccion ?? "venta",
        ubicacion: {
          ciudad: filters.ciudad ?? "La Paz",
        },
      },
    ];
  }
}

export const propertyRepository = new PropertyRepository();