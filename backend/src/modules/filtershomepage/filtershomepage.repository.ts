<<<<<<< HEAD
// 1. Importamos $Enums (con el signo $) desde el cliente generado
import { $Enums } from '@prisma/client'
import prisma from '../../config/prisma.js'
=======
import { $Enums, Prisma } from '@prisma/client'
import { prisma } from '../../db'
>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5

export class FiltersHomepageRepository {
  async getCountsByCity(tipoAccion: $Enums.TipoAccion) {
<<<<<<< HEAD
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
=======
    const groups = await prisma.ubicacion_maestra.groupBy({
      by: ['departamento'],
      where: {
        ubicacion_inmueble: {
          some: {
            inmueble: {
              tipoAccion: tipoAccion,
              estado: $Enums.EstadoInmueble.ACTIVO
            }
          }
        }
      }
    })

    const counts = await Promise.all(
      groups.map(async (g) => {
        const total = await prisma.ubicacionInmueble.count({
          where: {
            ubicacion_maestra: {
              departamento: g.departamento
            },
            inmueble: {
              tipoAccion: tipoAccion,
              estado: $Enums.EstadoInmueble.ACTIVO
            }
          }
        })

        return {
          departamento: g.departamento,
          count: total
        }
      })
    )

    return counts.sort((a, b) => b.count - a.count)
>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5
  }

  async getCountsByCategoria() {
    return await prisma.inmueble.groupBy({
      by: ['categoria'],
      where: {
<<<<<<< HEAD
        estado: $Enums.EstadoInmueble.ACTIVO
=======
        estado: $Enums.EstadoInmueble.ACTIVO,
        categoria: { not: null }
>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5
      },
      _count: {
        id: true
      }
    })
  }
}
