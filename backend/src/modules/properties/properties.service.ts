import { propertiesRepository } from './properties.repository.js'

type OrdenFecha = 'mas-recientes' | 'mas-populares'
type OrdenDireccion = 'menor-a-mayor' | 'mayor-a-menor'

interface FiltrosOrdenamiento {
  fecha?: OrdenFecha
  precio?: OrdenDireccion
  superficie?: OrdenDireccion
}

export const propertiesService = {
  async getAll(orden: FiltrosOrdenamiento = {}) {
    return propertiesRepository.getAll(orden)
  }
}
