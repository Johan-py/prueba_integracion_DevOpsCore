import { $Enums } from '@prisma/client'
import { prisma } from '../../lib/prisma.config.js'

export class FiltersHomepageRepository {
  async getCountsByCity(tipoAccion: $Enums.TipoAccion) {
    const ubicaciones = await prisma.ubicacionInmueble.findMany({
      where: {
        inmueble: {
          tipoAccion: tipoAccion,
          estado: $Enums.EstadoInmueble.ACTIVO,
        },
      },
      select: {
        inmuebleId: true, 
        ubicacion_maestra: {
          select: {
            departamento: true,
          },
        },
      },
    });

    const deptCounts = new Map<string, Set<number>>();

    for (const u of ubicaciones) {
      const rawDept = u.ubicacion_maestra?.departamento;
      if (!rawDept || !u.inmuebleId) continue;

      const normalizedDept = rawDept.trim().toUpperCase();

      if (!deptCounts.has(normalizedDept)) {
        deptCounts.set(normalizedDept, new Set());
      }
      
      deptCounts.get(normalizedDept)!.add(u.inmuebleId);
    }

    const counts = Array.from(deptCounts.entries()).map(([dept, ids]) => ({
      departamento: dept, 
      count: ids.size,
    }));

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