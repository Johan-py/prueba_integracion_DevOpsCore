import { propertiesRepository } from './properties.repository'

export const propertiesService = {
  async search(filtros: any) {
    return propertiesRepository.search(filtros)
  }
}
