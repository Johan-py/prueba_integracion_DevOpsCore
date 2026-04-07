import { $Enums } from '@prisma/client'
import { prisma } from '../../lib/prisma.config.ts'

export class FiltersHomepageRepository {
  async getCountsByCity(tipoAccion: $Enums.TipoAccion) {
    const groups = await prisma.ubicacion_maestra.groupBy({
      by: ["departamento"],
      where: {
        ubicacion_inmueble: {
          some: {
            inmueble: {
              tipoAccion: tipoAccion,
              estado: $Enums.EstadoInmueble.ACTIVO,
            },
          },
        },
      },
    });

    const counts = await Promise.all(
      groups.map(async (g) => {
        const total = await prisma.ubicacionInmueble.count({
          where: {
            ubicacion_maestra: {
              departamento: g.departamento,
            },
            inmueble: {
              tipoAccion: tipoAccion,
              estado: $Enums.EstadoInmueble.ACTIVO,
            },
          },
        });

        return {
          departamento: g.departamento,
          count: total,
        };
      }),
    );

    return counts.sort((a, b) => b.count - a.count);
  }

  async getCountsByCategoria() {
    return await prisma.inmueble.groupBy({
      by: ["categoria"],
      where: {
        estado: $Enums.EstadoInmueble.ACTIVO,
        categoria: { not: null },
      },
      _count: {
        id: true,
      },
    });
  }
}
