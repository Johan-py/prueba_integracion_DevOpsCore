import { propertiesRepository } from './properties.repository.js'

type OrdenFecha = 'mas-recientes' | 'mas-populares' | 'mas-antiguos'
type OrdenDireccion = 'menor-a-mayor' | 'mayor-a-menor'

interface FiltrosBusqueda {
  categoria?: string | string[]
  tipoAccion?: string
  fecha?: OrdenFecha
  precio?: OrdenDireccion
  superficie?: OrdenDireccion
}

export const propertiesService = {
  // getAll: usado por el controller principal (GET /api/inmuebles)
  async getAll(filtros: FiltrosBusqueda = {}) {
    return propertiesRepository.getAll(filtros)
  },

  // search: alias de getAll para compatibilidad con el controller anterior
  async search(filtros: FiltrosBusqueda = {}) {
    return propertiesRepository.getAll(filtros)
  }
}
