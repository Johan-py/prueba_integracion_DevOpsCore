import { $Enums, Prisma } from '@prisma/client';
import { prisma } from '../../db';

export class FiltersHomepageRepository {
  
  async getCountsByCity(tipoAccion: $Enums.TipoAccion) {
    // 1. Usamos 'ubicacion_maestra' si así se llama tu tabla en el esquema
    const groups = await prisma.ubicacion_maestra.groupBy({
      by: ['departamento'],
      where: {
        // EN LOS FILTROS: Usamos con guion bajo como te pidió el error anterior
        ubicacion_inmueble: {
          some: {
            inmueble: {
              tipoAccion: tipoAccion,
              estado: $Enums.EstadoInmueble.ACTIVO,
            }
          }
        }
      }
    });

    const counts = await Promise.all(
      groups.map(async (g) => {
        // EN LA CONSULTA DIRECTA: Usamos SIN guion bajo como dice tu error actual
        const total = await prisma.ubicacionInmueble.count({
          where: {
            ubicacion_maestra: {
              departamento: g.departamento
            },
            inmueble: {
              tipoAccion: tipoAccion,
              estado: $Enums.EstadoInmueble.ACTIVO,
            }
          }
        });

        return {
          departamento: g.departamento,
          count: total
        };
      })
    );

    return counts.sort((a, b) => b.count - a.count);
  }

  async getCountsByCategoria() {
    return await prisma.inmueble.groupBy({
      by: ['categoria'],
      where: {
        estado: $Enums.EstadoInmueble.ACTIVO,
        categoria: { not: null }
      },
      _count: {
        id: true
      }
    });
  }
}