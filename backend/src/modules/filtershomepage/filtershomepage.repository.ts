// 1. Importamos $Enums (con el signo $) desde el cliente generado
import { $Enums } from '@prisma/client'
import prisma from '../../config/prisma.js'

export class FiltersHomepageRepository {
  // 2. Usamos $Enums.TipoAccion para el tipado
  async getCountsByCity(tipoAccion: $Enums.TipoAccion) {
    return await prisma.ubicacionInmueble.groupBy({
      by: ['ciudad'],
      where: {
        inmueble: {
          tipoAccion: tipoAccion,
          // 3. Usamos $Enums.EstadoInmueble para el valor
          estado: $Enums.EstadoInmueble.ACTIVO
        }
      },
      _count: {
        id: true
      }
    })
  }

  async getCountsByCategoria() {
    return await prisma.inmueble.groupBy({
      by: ['categoria'],
      where: {
        estado: $Enums.EstadoInmueble.ACTIVO
      },
      _count: {
        id: true
      }
    })
  }
}
