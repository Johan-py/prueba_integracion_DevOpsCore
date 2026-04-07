import { LocationsRepository } from "./locations.repository.js";

export class LocationsService {
  private repository = new LocationsRepository();

  async searchLocations(query: string) {
    if (!query || query.length < 2) return [];
    return await this.repository.findByName(query);
  }
  // Este método recibe el ID desde el frontend y lo pasa al repositorio -- BitPro
  async incrementPopularity(id: number) {
    if (!id) throw new Error("ID de ubicación no proporcionado");
    return await this.repository.incrementPopularity(id);
  }
}
