import { prisma } from '../../lib/prisma.config.js'

export interface FiltrosBusqueda {
  categoria?: string | string[];
  tipoInmueble?: string | string[];
  modoInmueble?: string | string[];
  query?: string;
  locationId?: number;
  fecha?: "mas-recientes" | "mas-populares" | "mas-antiguos";
  precio?: "menor-a-mayor" | "mayor-a-menor";
  superficie?: "menor-a-mayor" | "mayor-a-menor";
}

function normalizarModoAccion(m: string): string {
  const v = m.toUpperCase().trim();
  return v.includes("ANTICR") ? "ANTICRETO" : v;
}

export const propertiesRepository = {
  async getAll(filtros: FiltrosBusqueda = {}) {
    // ── WHERE ──────────────────────────────────────────────────────────────
    const where: any = { estado: "ACTIVO" };

    const rawTipo = filtros.tipoInmueble || filtros.categoria;
    if (rawTipo) {
      const tipos = (Array.isArray(rawTipo) ? rawTipo : [rawTipo])
        .map((t) => String(t).toUpperCase().trim())
        .filter((t) => t && t !== "CUALQUIER TIPO");
      if (tipos.length === 1) {
        where.categoria = tipos[0];
      } else if (tipos.length > 1) {
        where.categoria = { in: tipos };
      }
    }

    if (filtros.modoInmueble) {
      const modosRaw = Array.isArray(filtros.modoInmueble)
        ? filtros.modoInmueble
        : [filtros.modoInmueble];
      const modos = modosRaw
        .filter((m) => m && String(m).trim() !== "")
        .map((m) => normalizarModoAccion(String(m)));
      if (modos.length === 1) {
        where.tipoAccion = modos[0];
      } else if (modos.length > 1) {
        where.tipoAccion = { in: modos };
      }
    }

    if (filtros.locationId || (filtros.query && filtros.query.trim() !== "")) {
      where.OR = [];

      // 1. Buscar por ID de zona exacta (Ideal cuando pases a producción)
      if (filtros.locationId) {
        where.OR.push({
          ubicacion: { ubicacionMaestraId: Number(filtros.locationId) },
        });
      }

      // 2. Buscar por texto (Salva la vida con datos de prueba o sin ID enlazado)
      if (filtros.query && filtros.query.trim() !== "") {
        // Extraemos la primera parte (Ej: Saca "Cala Cala" de "Cala Cala - Cochabamba - Bolivia")
        const textoLimpio = filtros.query.split("-")[0].trim();

        where.OR.push({
          titulo: { contains: textoLimpio, mode: "insensitive" },
        });
        where.OR.push({
          descripcion: { contains: textoLimpio, mode: "insensitive" },
        });

        // También buscamos en la dirección textual de la ubicación
        where.OR.push({
          ubicacion: {
            direccion: { contains: textoLimpio, mode: "insensitive" },
          },
        });
      }
    }

    // ── ORDER BY ───────────────────────────────────────────────────────────
    // mas-populares: ordena por ubicacion → ubicacion_maestra → popularidad desc
    // Prisma soporta orderBy anidado siguiendo las relaciones del schema.
    // Los inmuebles sin ubicacion o sin ubicacion_maestra quedan al final
    // porque Prisma coloca nulls last por defecto en desc.
    //
    // Para precio y superficie: el frontend los maneja con criterioActivo,
    // así que el backend solo necesita proveer el default y popularidad.
    const orderBy: any[] = [];

    if (filtros.precio === "menor-a-mayor") {
      orderBy.push({ precio: "asc" });
      orderBy.push({ id: "asc" });
    } else if (filtros.precio === "mayor-a-menor") {
      orderBy.push({ precio: "desc" });
    } else if (filtros.superficie === "menor-a-mayor") {
      orderBy.push({ superficieM2: "asc" });
    } else if (filtros.superficie === "mayor-a-menor") {
      orderBy.push({ superficieM2: "desc" });
    } else if (filtros.fecha === "mas-recientes") {
      orderBy.push({ fechaPublicacion: "desc" });
    } else if (filtros.fecha === "mas-antiguos") {
      orderBy.push({ fechaPublicacion: "asc" });
    }

    orderBy.push({ id: "asc" }); // Desempate default

    return prisma.inmueble.findMany({
      where,
      orderBy,
      include: {
        ubicacion: {
          include: {
            ubicacion_maestra: true, // Vital para mostrar zonas de Cochabamba
          },
        },
        publicaciones: {
          where: { estado: "ACTIVA" },
          include: { multimedia: true }, // Para obtener las fotos reales
        },
      },
    });
  },
};
