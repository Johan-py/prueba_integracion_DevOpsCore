import { PropertyFilters } from "./properties.types.js";
import { propertyRepository } from "./properties.repository.js";

class PropertyService {
  async getFilteredProperties(filters: PropertyFilters) {
    return propertyRepository.findWithFilters(filters);
  }
}

export const propertyService = new PropertyService();