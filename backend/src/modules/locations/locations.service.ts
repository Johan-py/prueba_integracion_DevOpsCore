import { LocationsRepository } from './locations.repository.js'

export class LocationsService {
  private repository = new LocationsRepository()

  async searchLocations(query: string) {
    if (!query || query.length < 2) return []
    return await this.repository.findByName(query)
  }
}
