import { prisma } from "../../lib/prisma.client.js";

export interface FiltrosBusqueda {
  categoria?: string | string[];
  tipoInmueble?: string | string[];
  modoInmueble?: string | string[];
  query?: string;
  locationId?: number;
  departamentoId?: string | number;
  provinciaId?: string | number;
  municipioId?: string | number;
  zonaId?: string | number;
  barrioId?: string | number;
  fecha?:
    | "mas-recientes"
    | "mas-populares"
    | "mas-antiguos"
    | "mayor-descuento";
  precio?: "menor-a-mayor" | "mayor-a-menor";
  superficie?: "menor-a-mayor" | "mayor-a-menor";
  minPrice?: number | null;
  maxPrice?: number | null;
  currency?: string | null;
  minSuperficie?: number | null;
  maxSuperficie?: number | null;

  dormitoriosMin?: number;
  dormitoriosMax?: number;
  banosMin?: number;
  banosMax?: number;
  banoCompartido?: boolean;
  lat?: number;
  lng?: number;
  radius?: number;
  amenities?: number[];
  labels?: number[];
  soloOfertas?: boolean; // NUEVO: Filtro para mostrar solo ofertas (precio actual < precio anterior)
}

// Helper para limpiar las variaciones de Anticrético
function normalizarModoAccion(m: string): string {
  const v = m.toUpperCase().trim();
  return v.includes("ANTICR") ? "ANTICRETO" : v;
}

export const propertiesRepository = {
  async getAll(filtros: FiltrosBusqueda = {}) {
    // ── WHERE ──────────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { estado: "ACTIVO" };

    // 1. Filtro de Categoría / Tipo Inmueble (Soporta múltiples selecciones)
    const CATEGORIAS_VALIDAS = [
      "CASA",
      "DEPARTAMENTO",
      "TERRENO",
      "OFICINA",
      "CUARTO",
      "TERRENO_MORTUORIO",
    ];
    const rawTipo = filtros.tipoInmueble || filtros.categoria;
    if (rawTipo) {
      const rawArr = (Array.isArray(rawTipo) ? rawTipo : [rawTipo])
        .map((t) => String(t).toUpperCase().trim())
        .filter((t) => t && t !== "CUALQUIER TIPO");

      const tipos = rawArr.filter((t) => CATEGORIAS_VALIDAS.includes(t));

      if (rawArr.length > 0 && tipos.length === 0) {
        return [];
      } else if (tipos.length === 1) {
        where.categoria = tipos[0];
      } else if (tipos.length > 1) {
        where.categoria = { in: tipos };
      }
    }

    // 2. Filtro de Modo Inmueble (Soporta Venta, Alquiler, Anticrético simultáneos)
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

    // 3. Filtro de Ubicación (EL CEREBRO JERÁRQUICO)
    if (filtros.lat && filtros.lng) {
      // Búsqueda geoespacial por latitud/longitud con un radio (en km)
    } else if (filtros.query && filtros.query.trim().length >= 3) {
      // NUEVO: Refuerzo de >= 3 caracteres
      // Fallback original: Búsqueda estricta por texto
      const texto = filtros.query.trim();

      where.OR = [
        { titulo: { contains: texto, mode: "insensitive" } },
        { descripcion: { contains: texto, mode: "insensitive" } },
        {
          ubicacion: {
            OR: [
              { direccion: { contains: texto, mode: "insensitive" } },
              { barrio: { nombre: { contains: texto, mode: "insensitive" } } },
              {
                barrio: {
                  zona: { nombre: { contains: texto, mode: "insensitive" } },
                },
              },
              {
                barrio: {
                  zona: {
                    municipio: {
                      nombre: { contains: texto, mode: "insensitive" },
                    },
                  },
                },
              },
              {
                barrio: {
                  zona: {
                    municipio: {
                      provincia: {
                        nombre: { contains: texto, mode: "insensitive" },
                      },
                    },
                  },
                },
              },
              {
                barrio: {
                  zona: {
                    municipio: {
                      provincia: {
                        departamento: {
                          nombre: { contains: texto, mode: "insensitive" },
                        },
                      },
                    },
                  },
                },
              },
              {
                ubicacion_maestra: {
                  nombre: { contains: texto, mode: "insensitive" },
                },
              },
            ],
          },
        },
      ];
    } else if (filtros.locationId) {
      // Fallback: Si no hay texto, asumimos que viene de un botón antiguo de "Ciudades Destacadas"
      where.ubicacion = { ubicacionMaestraId: Number(filtros.locationId) };
    }
    // Si un nivel está seleccionado y no es "todos", lo aplicamos y las demás condiciones (else if) se ignoran.
    if (
      filtros.barrioId &&
      String(filtros.barrioId).toLowerCase() !== "todos"
    ) {
      where.ubicacion = {
        ...where.ubicacion,
        barrio_id: Number(filtros.barrioId),
      };
    } else if (
      filtros.zonaId &&
      String(filtros.zonaId).toLowerCase() !== "todos"
    ) {
      where.ubicacion = {
        ...where.ubicacion,
        barrio: { zona_id: Number(filtros.zonaId) },
      };
    } else if (
      filtros.municipioId &&
      String(filtros.municipioId).toLowerCase() !== "todos"
    ) {
      where.ubicacion = {
        ...where.ubicacion,
        barrio: { zona: { municipio_id: Number(filtros.municipioId) } },
      };
    } else if (
      filtros.provinciaId &&
      String(filtros.provinciaId).toLowerCase() !== "todos"
    ) {
      where.ubicacion = {
        ...where.ubicacion,
        barrio: {
          zona: { municipio: { provincia_id: Number(filtros.provinciaId) } },
        },
      };
    } else if (
      filtros.departamentoId &&
      String(filtros.departamentoId).toLowerCase() !== "todos"
    ) {
      where.ubicacion = {
        ...where.ubicacion,
        barrio: {
          zona: {
            municipio: {
              provincia: { departamento_id: Number(filtros.departamentoId) },
            },
          },
        },
      };
    }
    // ── FILTRO DE PRECIO con conversión de moneda ─────────────────
    const TASA_CAMBIO_BOB = 6.96; // 1 USD = 6.96 BOB

    let queryMinPrice = filtros.minPrice;
    let queryMaxPrice = filtros.maxPrice;

    // Si el usuario busca en BOB, convertimos a USD antes de consultar la BD
    if (filtros.currency) {
      const monedaUpper = filtros.currency.toUpperCase();
      if (monedaUpper === "BOB" || monedaUpper === "BS") {
        if (queryMinPrice != null)
          queryMinPrice = queryMinPrice / TASA_CAMBIO_BOB;
        if (queryMaxPrice != null)
          queryMaxPrice = queryMaxPrice / TASA_CAMBIO_BOB;
      }
    }

    if (queryMinPrice != null) {
      where.precio = {
        ...((where.precio as object) ?? {}),
        gte: queryMinPrice,
      };
    }
    if (queryMaxPrice != null) {
      where.precio = {
        ...((where.precio as object) ?? {}),
        lte: queryMaxPrice,
      };
    }

    if (
      filtros.dormitoriosMin !== undefined ||
      filtros.dormitoriosMax !== undefined
    ) {
      where.nroCuartos = {};
      if (filtros.dormitoriosMin !== undefined) {
        where.nroCuartos.gte = filtros.dormitoriosMin;
      }
      if (filtros.dormitoriosMax !== undefined) {
        where.nroCuartos.lte = filtros.dormitoriosMax;
      }
    }

    if (filtros.banosMin !== undefined || filtros.banosMax !== undefined) {
      where.nroBanos = {};
      if (filtros.banosMin !== undefined) {
        where.nroBanos.gte = filtros.banosMin;
      }
      if (filtros.banosMax !== undefined) {
        where.nroBanos.lte = filtros.banosMax;
      }
    }

    if (filtros.banoCompartido !== undefined) {
      where.banoCompartido = filtros.banoCompartido;
    }
    // ── FILTRO DE SUPERFICIE ──────────────────────────────────────────────
    if (filtros.minSuperficie != null || filtros.maxSuperficie != null) {
      where.superficieM2 = {};
      if (filtros.minSuperficie != null) {
        where.superficieM2.gte = filtros.minSuperficie;
      }
      if (filtros.maxSuperficie != null) {
        where.superficieM2.lte = filtros.maxSuperficie;
      }
    }
    //HU6
    // Filtros por Amenidades (Lógica AND: debe tener TODAS las seleccionadas)
    if (filtros.amenities && filtros.amenities.length > 0) {
      where.AND = [
        ...(where.AND || []),
        ...filtros.amenities.map((id) => ({
          inmueble_amenidad: { some: { amenidad_id: id } },
        })),
      ];
    }

    // Filtros por Etiquetas (Lógica AND)
    if (filtros.labels && filtros.labels.length > 0) {
      where.AND = [
        ...(where.AND || []),
        ...filtros.labels.map((labelId) => ({
          publicaciones: {
            some: {
              estado: 'ACTIVA' as const,
              publicacion_tag: {
                some: {
                  tag_id: labelId
                }
              }
            }
          }
        }))
      ]
    }

    // HU6 - Filtro solo ofertas
    if (filtros.soloOfertas === true) {
      where.precio = {
        ...((where.precio as object) ?? {}),
        lt: prisma.inmueble.fields.precio_anterior
      }
    }

    // ── ORDER BY ───────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    } else if (filtros.fecha === "mas-populares") {
      // fallback mientras se ordena en memoria
      orderBy.push({ fechaPublicacion: "desc" });
    } else if (filtros.fecha === "mayor-descuento") {
      orderBy.push({ id: "asc" });
    }

    orderBy.push({ id: "asc" }); // Desempate default

    // ── EJECUCIÓN PRISMA ───────────────────────────────────────────────────
    const inmuebles = await prisma.inmueble.findMany({
      where,
      orderBy,
      include: {
        ubicacion: {
          include: {
            barrio: {
              include: {
                zona: {
                  include: {
                    municipio: {
                      include: {
                        provincia: {
                          include: { departamento: true },
                        },
                      },
                    },
                  },
                },
              },
            },
            ubicacion_maestra: true,
          },
        },
        publicaciones: {
          where: { estado: "ACTIVA" },
          include: { multimedia: true },
        },
      },
    });

    const resultados =
      filtros.lat && filtros.lng
        ? inmuebles.filter((inmueble) => {
            const u = inmueble.ubicacion;
            if (!u || !u.latitud || !u.longitud) return false;

            const lat = Number(u.latitud);
            const lng = Number(u.longitud);

            // Ignorar coordenadas inválidas
            if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0))
              return false;

            const centerLat = Number(filtros.lat);
            const centerLng = Number(filtros.lng);
            const radiusKm = filtros.radius || 1; // 1 km por defecto (igual que en el mapa)

            // Fórmula matemática para calcular distancia exacta en esfera (Tierra)
            const R = 6371; // Radio de la Tierra en km
            const dLat = ((lat - centerLat) * Math.PI) / 180;
            const dLng = ((lng - centerLng) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((centerLat * Math.PI) / 180) *
                Math.cos((lat * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distancia = R * c;

            // Solo retorna true si la propiedad está estrictamente dentro del radio
            return distancia <= radiusKm;
          })
        : inmuebles;

    if (filtros.fecha === "mas-populares") {
      console.log("🔥 Entrando al bloque mas-populares");
      const vistas = await prisma.propiedad_vista.groupBy({
        by: ["inmuebleId"],
        _count: { usuarioId: true }, // usuarios únicos por inmueble
        orderBy: { _count: { usuarioId: "desc" } },
      });
      const vistaMap = new Map(
        vistas.map((v) => [v.inmuebleId, v._count.usuarioId ?? 0]),
      );
      return resultados.sort(
        (a, b) => (vistaMap.get(b.id) ?? 0) - (vistaMap.get(a.id) ?? 0),
      );
    }
    if (filtros.fecha === "mayor-descuento") {
      return resultados.sort((a, b) => {
        const precioAnteriorA = Number((a as any).precio_anterior ?? 0);
        const precioActualA = Number(a.precio);

        const precioAnteriorB = Number((b as any).precio_anterior ?? 0);
        const precioActualB = Number(b.precio);

        const descuentoA =
          precioAnteriorA > precioActualA
            ? ((precioAnteriorA - precioActualA) / precioAnteriorA) * 100
            : 0;

        const descuentoB =
          precioAnteriorB > precioActualB
            ? ((precioAnteriorB - precioActualB) / precioAnteriorB) * 100
            : 0;

        return descuentoB - descuentoA;
      });
    }

    return resultados;
  },
  // NUEVO MÉTODO PARA EL COMPARADOR
  async getByIds(ids: number[]) {
    const inmuebles = await prisma.inmueble.findMany({
      where: {
        id: { in: ids },
        estado: "ACTIVO",
      },
      // Incluimos exactamente lo necesario para la matriz comparativa
      include: {
        publicaciones: {
          where: { estado: "ACTIVA" },
          include: { multimedia: true },
        },
        inmueble_etiqueta: {
          include: { etiqueta: true },
        },
        inmueble_amenidad: {
          include: { amenidad: true },
        },
      },
    });

    return inmuebles;
  },
};
