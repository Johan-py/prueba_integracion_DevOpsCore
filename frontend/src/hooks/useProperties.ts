import { useState, useEffect } from "react";
import { PropertyMapPin, PropertyType } from "@/types/property";
import { useSearchParams } from "next/navigation";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

interface RawPropertyItem {
  id: number
  titulo: string
  descripcion?: string
  precio: string | number
  precio_anterior?: string | number
  categoria?: string
  currency?: string
  moneda?: string
  nroCuartos?: number
  nroBanos?: number
  superficieM2?: string | number
  tipoAccion?: string

  // HU-13 Estadísticas
  totalVisualizaciones?: number | null
  total_visualizaciones?: number | null
  totalCompartidos?: number | null
  total_compartidos?: number | null

  estadistica?: {
    total_visualizaciones?: number | null
    total_compartidos?: number | null
  } | null

  publicacion_estadistica?: {
    total_visualizaciones?: number | null
    total_compartidos?: number | null
  } | null

  ubicacion?: {
    latitud: string | number
    longitud: string | number
    direccion?: string
    barrio?: {
      nombre?: string
      zona?: {
        nombre?: string
        municipio?: {
          nombre?: string
          provincia?: {
            nombre?: string
            departamento?: {
              nombre?: string
            }
          }
        }
      }
    }
    ubicacion_maestra?: { nombre?: string }
  }

  ubicacion_inmueble?: {
    latitud: string | number
    longitud: string | number
  }

  publicaciones?: Array<{
    id?: number
    multimedia?: Array<{ url: string }>
    publicacion_estadistica?: {
      total_visualizaciones?: number | null
      total_compartidos?: number | null
    } | null
  }>

  publicacion?: Array<{
    id?: number
    multimedia?: Array<{ url: string }>
    publicacion_estadistica?: {
      total_visualizaciones?: number | null
      total_compartidos?: number | null
    } | null
  }>

  thumbnailUrl?: string
  ubicacionTexto?: string
  direccion?: string
  score?: number
  razones?: string[]
}

const BOB_EXCHANGE_RATE = 6.96;

function traducirCategoria(categoria?: string): string {
  const normalizada = String(categoria || "").toUpperCase().trim();
  switch (normalizada) {
    case "CASA":
      return "Casa";
    case "DEPARTAMENTO":
      return "Departamento";
    case "TERRENO":
      return "Terreno";
    case "OFICINA":
      return "Oficina";
    case "CUARTO":
      return "Cuarto";
    case "TERRENO_MORTUORIO":
      return "Terreno mortuorio";
    default:
      return categoria || "Inmueble";
  }
}

function traducirAccion(accion?: string): string {
  const normalizada = String(accion || "").toUpperCase().trim();
  switch (normalizada) {
    case "VENTA":
      return "Venta";
    case "ALQUILER":
      return "Alquiler";
    case "ANTICRETO":
      return "Anticrético";
    default:
      return accion || "Sin acción";
  }
}

function construirUbicacionTexto(item: RawPropertyItem): string {
  const ubicacion = item.ubicacion as RawPropertyItem["ubicacion"] | undefined;
  const partes = [
    ubicacion?.direccion,
    ubicacion?.barrio?.nombre,
    ubicacion?.barrio?.zona?.nombre,
    ubicacion?.barrio?.zona?.municipio?.nombre,
    ubicacion?.barrio?.zona?.municipio?.provincia?.departamento?.nombre,
  ]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);

  if (partes.length > 0) return partes.join(", ");

  const fallback = ubicacion?.ubicacion_maestra?.nombre;
  if (typeof fallback === "string" && fallback.trim().length > 0) return fallback.trim();

  return "Ubicación no especificada";
}

interface UsePropertiesResult {
  properties: PropertyMapPin[];
  isLoading: boolean;
  error: string | null;
}

// HU-13: carga las estadísticas usando el publicacionId de cada propiedad
async function cargarEstadisticasParaPropiedades(
  propiedades: PropertyMapPin[]
): Promise<PropertyMapPin[]> {
  const publicacionesIds = Array.from(
    new Set(
      propiedades
        .map((property) => property.publicacionId)
        .filter((id): id is number => typeof id === 'number' && id > 0)
    )
  )

  if (publicacionesIds.length === 0) {
    return propiedades.map((property) => ({
      ...property,
      totalVisualizaciones: property.totalVisualizaciones ?? 0,
      totalCompartidos: property.totalCompartidos ?? 0
    }))
  }

  try {
    const response = await fetch(`${API_URL}/api/publicaciones/estadisticas-publicas/resumen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        publicacionesIds
      })
    })

    if (!response.ok) {
      return propiedades.map((property) => ({
        ...property,
        totalVisualizaciones: property.totalVisualizaciones ?? 0,
        totalCompartidos: property.totalCompartidos ?? 0
      }))
    }

    const data = await response.json()
    const resumen = data.data ?? {}

    return propiedades.map((property) => {
      const estadistica = property.publicacionId
        ? resumen[String(property.publicacionId)] ?? resumen[property.publicacionId]
        : null

      return {
        ...property,
        totalVisualizaciones: Number(
          estadistica?.totalVisualizaciones ??
            estadistica?.total_visualizaciones ??
            property.totalVisualizaciones ??
            0
        ),
        totalCompartidos: Number(
          estadistica?.totalCompartidos ??
            estadistica?.total_compartidos ??
            property.totalCompartidos ??
            0
        )
      }
    })
  } catch (error) {
    console.error('Error cargando estadísticas públicas de filtros:', error)

    return propiedades.map((property) => ({
      ...property,
      totalVisualizaciones: property.totalVisualizaciones ?? 0,
      totalCompartidos: property.totalCompartidos ?? 0
    }))
  }
}

export function useProperties(): UsePropertiesResult {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyMapPin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParamsStr = searchParams.toString();

  useEffect(() => {
    let cancelled = false;
    console.log("🔄 useProperties disparado:", searchParamsStr)

    async function fetchNormalSearch() {
      // Configuramos el temporizador de 1 segundo
      const loaderTimer = setTimeout(() => {
        if (!cancelled) setIsLoading(true);
      }, 1000);
      try {
        const res = await fetch(
          `${API_URL}/api/properties/inmuebles?${searchParamsStr}`,
        );
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const json = await res.json();

        const selectedCurrency = (
          (searchParams.get("currency") || "USD").toUpperCase() === "BOB"
            ? "BOB"
            : "USD"
        ) as "USD" | "BOB";

        if (!cancelled) {
          const mappedData: PropertyMapPin[] = (json.data || [])
            .filter((item: RawPropertyItem) => {
              const ubicacion = item.ubicacion ?? item.ubicacion_inmueble;
              const lat = Number(ubicacion?.latitud);
              const lng = Number(ubicacion?.longitud);
              return (
                ubicacion &&
                !isNaN(lat) &&
                !isNaN(lng) &&
                lat !== 0 &&
                lng !== 0
              );
            })
            .map((item: RawPropertyItem) => {
              const ubicacion = (item.ubicacion ?? item.ubicacion_inmueble)!;
              const publicaciones = item.publicaciones ?? item.publicacion ?? [];
              const basePrice = Number(item.precio);
              const sourceCurrency = String(
                item.currency || item.moneda || "USD",
              ).toUpperCase();
              const priceInUsd =
                sourceCurrency === "BOB"
                  ? basePrice / BOB_EXCHANGE_RATE
                  : basePrice;
              const displayPrice =
                selectedCurrency === "BOB"
                  ? priceInUsd * BOB_EXCHANGE_RATE
                  : priceInUsd;
              const formattedText =
                selectedCurrency === "BOB"
                  ? `Bs ${displayPrice.toLocaleString("es-BO")}`
                  : `$${displayPrice.toLocaleString("en-US")} USD`;
              const categoriaTexto = traducirCategoria(item.categoria);
              const accionTexto = traducirAccion(item.tipoAccion);

              return {
                id: item.id.toString(),
                lat: Number(ubicacion.latitud),
                lng: Number(ubicacion.longitud),
                price: displayPrice,
                currency: selectedCurrency,
                precioFormateado: formattedText,
                precio: Number(item.precio),
                precio_anterior: item.precio_anterior
                  ? Number(item.precio_anterior)
                  : null,
                type: (item.categoria?.toLowerCase().trim() ||
                  "casa") as PropertyType,
                title: item.titulo,
                descripcion: item.descripcion ?? null,
                ubicacionTexto: construirUbicacionTexto(item),
                categoriaTexto,
                accionTexto,
                nroCuartos: item.nroCuartos ?? null,
                nroBanos: item.nroBanos ?? null,
                superficieM2: item.superficieM2
                  ? Number(item.superficieM2)
                  : null,
                thumbnailUrl:
                  publicaciones?.[0]?.multimedia?.[0]?.url ?? undefined,

                // HU-13: id de publicación para consultar estadísticas
                publicacionId: publicaciones?.[0]?.id ?? null,

                // HU-13: estadísticas si el endpoint ya las envía
                totalVisualizaciones: Number(
                  item.totalVisualizaciones ??
                    item.total_visualizaciones ??
                    item.estadistica?.total_visualizaciones ??
                    item.publicacion_estadistica?.total_visualizaciones ??
                    item.publicaciones?.[0]?.publicacion_estadistica
                      ?.total_visualizaciones ??
                    item.publicacion?.[0]?.publicacion_estadistica
                      ?.total_visualizaciones ??
                    0
                ),

                totalCompartidos: Number(
                  item.totalCompartidos ??
                    item.total_compartidos ??
                    item.estadistica?.total_compartidos ??
                    item.publicacion_estadistica?.total_compartidos ??
                    item.publicaciones?.[0]?.publicacion_estadistica
                      ?.total_compartidos ??
                    item.publicacion?.[0]?.publicacion_estadistica
                      ?.total_compartidos ??
                    0
                ),
              };
            });

          const propiedadesConEstadisticas =
            await cargarEstadisticasParaPropiedades(mappedData);

          setProperties(propiedadesConEstadisticas);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al conectar con PropBol",
          );
        }
      } finally {
        // Limpiamos el temporizador si fue rápido
        clearTimeout(loaderTimer);
        if (!cancelled) setIsLoading(false);
      }
    }

    async function fetchRecomendados() {
      const loaderTimer = setTimeout(() => {
        if (!cancelled) setIsLoading(true);
      }, 1000);
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const headers: Record<string, string> = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        if (!token) {
          const modos = searchParams.getAll("modoInmueble");
          const qs = new URLSearchParams();

          qs.set("fecha", "mas-populares");
          modos.forEach((m) => qs.append("modoInmueble", m));

          const res = await fetch(
            `${API_URL}/api/properties/inmuebles?${qs.toString()}`
          );

          if (!res.ok) throw new Error(`Error ${res.status}`);

          const json = await res.json();

          const selectedCurrency = (
            (searchParams.get("currency") || "USD").toUpperCase() === "BOB"
              ? "BOB"
              : "USD"
          ) as "USD" | "BOB";

          if (!cancelled) {
            const mappedData: PropertyMapPin[] = (json.data || [])
              .filter((item: RawPropertyItem) => {
                const ubicacion = item.ubicacion ?? item.ubicacion_inmueble;
                const lat = Number(ubicacion?.latitud);
                const lng = Number(ubicacion?.longitud);

                return (
                  ubicacion &&
                  !isNaN(lat) &&
                  !isNaN(lng) &&
                  lat !== 0 &&
                  lng !== 0
                );
              })
              .map((item: RawPropertyItem) => {
                const ubicacion = (item.ubicacion ?? item.ubicacion_inmueble)!;
                const publicaciones = item.publicaciones ?? item.publicacion ?? [];
                const basePrice = Number(item.precio);

                const priceInUsd =
                  String(item.currency || "USD").toUpperCase() === "BOB"
                    ? basePrice / BOB_EXCHANGE_RATE
                    : basePrice;

                const displayPrice =
                  selectedCurrency === "BOB"
                    ? priceInUsd * BOB_EXCHANGE_RATE
                    : priceInUsd;

                const formattedText =
                  selectedCurrency === "BOB"
                    ? `Bs ${displayPrice.toLocaleString("es-BO")}`
                    : `$${displayPrice.toLocaleString("en-US")} USD`;

                return {
                  id: item.id.toString(),
                  lat: Number(ubicacion.latitud),
                  lng: Number(ubicacion.longitud),
                  price: displayPrice,
                  currency: selectedCurrency,
                  precioFormateado: formattedText,
                  precio: Number(item.precio),
                  precio_anterior: item.precio_anterior
                    ? Number(item.precio_anterior)
                    : null,
                  type: (item.categoria?.toLowerCase().trim() ||
                    "casa") as PropertyType,
                  title: item.titulo,
                  descripcion: item.descripcion ?? null,
                  ubicacionTexto: construirUbicacionTexto(item),
                  categoriaTexto: traducirCategoria(item.categoria),
                  accionTexto: traducirAccion(item.tipoAccion),
                  nroCuartos: item.nroCuartos ?? null,
                  nroBanos: item.nroBanos ?? null,
                  superficieM2: item.superficieM2
                    ? Number(item.superficieM2)
                    : null,
                  thumbnailUrl:
                    publicaciones?.[0]?.multimedia?.[0]?.url ?? undefined,

                  // HU-13: id de publicación para consultar estadísticas
                  publicacionId: publicaciones?.[0]?.id ?? null,

                  // HU-13: estadísticas si el endpoint ya las envía
                  totalVisualizaciones: Number(
                    item.totalVisualizaciones ??
                      item.total_visualizaciones ??
                      item.estadistica?.total_visualizaciones ??
                      item.publicacion_estadistica?.total_visualizaciones ??
                      item.publicaciones?.[0]?.publicacion_estadistica
                        ?.total_visualizaciones ??
                      item.publicacion?.[0]?.publicacion_estadistica
                        ?.total_visualizaciones ??
                      0
                  ),

                  totalCompartidos: Number(
                    item.totalCompartidos ??
                      item.total_compartidos ??
                      item.estadistica?.total_compartidos ??
                      item.publicacion_estadistica?.total_compartidos ??
                      item.publicaciones?.[0]?.publicacion_estadistica
                        ?.total_compartidos ??
                      item.publicacion?.[0]?.publicacion_estadistica
                        ?.total_compartidos ??
                      0
                  ),
                };
              });

            const propiedadesConEstadisticas =
              await cargarEstadisticasParaPropiedades(mappedData);

            setProperties(propiedadesConEstadisticas);
          }

          return;
        }

        // Intentamos respetar una "zona" textual si el usuario la está filtrando.
        const zona = searchParams.get("query") || undefined;
        const limit = 200;
        const url = new URL(`${API_URL}/api/recomendaciones/inmuebles`);

        if (zona) url.searchParams.set("zona", zona);

        url.searchParams.set("limit", String(limit));

        const res = await fetch(url.toString(), { headers });

        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

        const json = await res.json();

        const data = json.data || [];
        const selectedCurrency =
          (searchParams.get("currency") || "USD").toUpperCase() === "BOB"
            ? "BOB"
            : "USD";

        const mappedData: PropertyMapPin[] = data
          .filter((item: RawPropertyItem) => {
            const ubicacion = item.ubicacion ?? item.ubicacion_inmueble;
            const lat = Number(ubicacion?.latitud);
            const lng = Number(ubicacion?.longitud);

            return (
              ubicacion &&
              !isNaN(lat) &&
              !isNaN(lng) &&
              lat !== 0 &&
              lng !== 0
            );
          })
          .map((item: RawPropertyItem) => {
            const ubicacion = (item.ubicacion ?? item.ubicacion_inmueble)!;
            const publicaciones = item.publicaciones ?? item.publicacion ?? [];
            const basePrice = Number(item.precio);
            const sourceCurrency = String(
              item.currency || item.moneda || "USD"
            ).toUpperCase();

            const priceInUsd =
              sourceCurrency === "BOB"
                ? basePrice / BOB_EXCHANGE_RATE
                : basePrice;

            const displayPrice =
              selectedCurrency === "BOB"
                ? priceInUsd * BOB_EXCHANGE_RATE
                : priceInUsd;

            const formattedText =
              selectedCurrency === "BOB"
                ? `Bs ${displayPrice.toLocaleString("es-BO")}`
                : `$${displayPrice.toLocaleString("en-US")} USD`;

            const categoriaTexto = traducirCategoria(item.categoria);
            const accionTexto = traducirAccion(item.tipoAccion);

            const ubicacionTexto =
              item.ubicacionTexto ||
              item.direccion ||
              item.ubicacion?.direccion ||
              "Ubicación no especificada";

            return {
              id: item.id.toString(),
              lat: Number(ubicacion.latitud),
              lng: Number(ubicacion.longitud),
              price: displayPrice,
              currency: selectedCurrency,
              precioFormateado: formattedText,
              precio: Number(item.precio),
              precio_anterior: item.precio_anterior
                ? Number(item.precio_anterior)
                : null,
              type: (item.categoria?.toLowerCase().trim() ||
                "casa") as PropertyType,
              title: item.titulo,
              descripcion: item.descripcion ?? null,
              ubicacionTexto,
              categoriaTexto,
              accionTexto,
              nroCuartos: item.nroCuartos ?? null,
              nroBanos: item.nroBanos ?? null,
              superficieM2: item.superficieM2 ? Number(item.superficieM2) : null,
              thumbnailUrl:
                item.thumbnailUrl ||
                publicaciones?.[0]?.multimedia?.[0]?.url ||
                undefined,

              // HU-13: id de publicación para consultar estadísticas
              publicacionId: publicaciones?.[0]?.id ?? null,

              // HU-13: estadísticas si el endpoint ya las envía
              totalVisualizaciones: Number(
                item.totalVisualizaciones ??
                  item.total_visualizaciones ??
                  item.estadistica?.total_visualizaciones ??
                  item.publicacion_estadistica?.total_visualizaciones ??
                  item.publicaciones?.[0]?.publicacion_estadistica
                    ?.total_visualizaciones ??
                  item.publicacion?.[0]?.publicacion_estadistica
                    ?.total_visualizaciones ??
                  0
              ),

              totalCompartidos: Number(
                item.totalCompartidos ??
                  item.total_compartidos ??
                  item.estadistica?.total_compartidos ??
                  item.publicacion_estadistica?.total_compartidos ??
                  item.publicaciones?.[0]?.publicacion_estadistica
                    ?.total_compartidos ??
                  item.publicacion?.[0]?.publicacion_estadistica
                    ?.total_compartidos ??
                  0
              ),

              score: item.score,
              razones: item.razones,
            };
          });

        if (!cancelled) {
          const propiedadesConEstadisticas =
            await cargarEstadisticasParaPropiedades(mappedData);

          setProperties(propiedadesConEstadisticas);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error recomendados:", err);
          await fetchNormalSearch();
        }
      } finally {
        clearTimeout(loaderTimer);
        if (!cancelled) setIsLoading(false);
      }
    }

    async function fetchProperties() {
      setIsLoading(true); // ← AGREGAR
      setProperties([]);
      setError(null);

      // ✅ Modo recomendados (persistente por URL)
      if (searchParams.get("orden") === "recomendados") {
        await fetchRecomendados();
        return;
      }

      await fetchNormalSearch();
    }

    fetchProperties();

    return () => {
      cancelled = true;
    };
  }, [searchParamsStr, searchParams]);

  return { properties, isLoading, error };
}
