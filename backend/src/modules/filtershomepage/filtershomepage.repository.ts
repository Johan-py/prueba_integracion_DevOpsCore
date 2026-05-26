import { $Enums } from "@prisma/client";
import { prisma } from "../../lib/prisma.client.js";

const CIUDAD_A_DEPTO: Record<string, string> = {
  "SANTA CRUZ DE LA SIERRA": "SANTA CRUZ",
  "SANTA CRUZ": "SANTA CRUZ",
  "LA PAZ": "LA PAZ",
  "EL ALTO": "LA PAZ",
  COCHABAMBA: "COCHABAMBA",
  QUILLACOLLO: "COCHABAMBA",
  SACABA: "COCHABAMBA",
  ORURO: "ORURO",
  POTOSI: "POTOSÍ",
  POTOSÍ: "POTOSÍ",
  SUCRE: "SUCRE",
  CHUQUISACA: "SUCRE",
  TARIJA: "TARIJA",
  TRINIDAD: "BENI",
  BENI: "BENI",
  COBIJA: "PANDO",
  PANDO: "PANDO",
};

function resolverDepartamento(raw: string): string {
  const upper = raw.trim().toUpperCase();
  return CIUDAD_A_DEPTO[upper] ?? upper;
}

export class FiltersHomepageRepository {
  // backend/src/modules/filtershomepage/filtershomepage.repository.ts

  async getCountsByCity(tipo_accion: $Enums.tipo_accion) {
    const ubicaciones = await prisma.ubicacion_inmueble.findMany({
      where: {
        inmueble: {
          tipo_accion: tipo_accion,
          estado: $Enums.EstadoInmueble.ACTIVO,
        },
        latitud: { not: 0 },
        longitud: { not: 0 },
      },
      select: {
        inmueble_id: true,
        ciudad: true,
        ubicacion_maestra: { select: { departamento: true } },
        inmueble: {
          select: {
            id: true,
            titulo: true,
            // Volvemos a tu estructura original que es la correcta para tu base de datos
            publicaciones: {
              take: 1,
              select: {
                multimedia: {
                  where: { tipo: $Enums.tipo_multimedia.IMAGEN },
                  select: { url: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    const deptMap = new Map<
      string,
      { ids: Set<number>; previews: Array<{ imagen: string; titulo: string }> }
    >();

    for (const u of ubicaciones) {
      const rawDept = u.ubicacion_maestra?.departamento ?? u.ciudad ?? null;
      if (!rawDept || !u.inmueble_id) continue;

      const dept = resolverDepartamento(rawDept);

      if (!deptMap.has(dept)) {
        deptMap.set(dept, { ids: new Set(), previews: [] });
      }

      const entry = deptMap.get(dept)!;
      entry.ids.add(u.inmueble_id);
      
      const inmueble = u.inmueble;

      // Aquí está el truco: Navegamos de forma segura por Inmueble -> Publicaciones -> Multimedia
      const primeraImagen = inmueble?.publicaciones?.[0]?.multimedia?.[0]?.url ?? null;

      if (entry.previews.length < 6 && primeraImagen && inmueble) {
        entry.previews.push({
          imagen: primeraImagen,
          titulo: inmueble.titulo ?? "Sin título",
        });
      }
    }

    return Array.from(deptMap.entries()).map(([dept, data]) => ({
      departamento: dept,
      count: data.ids.size,
      previews: data.previews,
    })).sort((a, b) => b.count - a.count);
  }

  async getCountsByCategoria() {
    return await prisma.inmueble.groupBy({
      by: ["categoria"],
      where: {
        estado: $Enums.EstadoInmueble.ACTIVO,
        categoria: { not: null },
        ubicacion: {
          latitud: { not: 0 },
          longitud: { not: 0 }
        }
      },
      _count: {
        id: true,
      },
    });
  }
}
