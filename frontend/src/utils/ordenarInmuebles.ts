import { Inmueble, EstadoOrdenamiento } from "../types/inmueble";

/**
 * Ordena inmuebles según el criterioActivo del estado:
 *
 *  null        → default: fecha más recientes (primera carga / limpiar ordenamiento)
 *  'fecha'     → solo por el valor de orden.fecha
 *  'precio'    → solo por orden.precio (asc o desc)
 *  'superficie'→ solo por orden.superficie (asc o desc)
 */
export function ordenarInmuebles(
  inmuebles: Inmueble[],
  orden: EstadoOrdenamiento,
): Inmueble[] {
  return [...inmuebles].sort((a, b) => {
    // ── DEFAULT o criterio FECHA ───────────────────────────────────────────
    // null  → siempre cae aquí y aplica 'mas-recientes'
    // fecha → aplica lo que el usuario eligió
    if (orden.criterioActivo === null || orden.criterioActivo === "fecha") {
      const tsA = new Date(a.fechaPublicacion).getTime();
      const tsB = new Date(b.fechaPublicacion).getTime();

      if (orden.fecha === "mas-recientes") return tsB - tsA;
      if (orden.fecha === "mas-antiguos") return tsA - tsB;
      if (orden.fecha === "mas-populares") {
        return (b.popularidad ?? 0) - (a.popularidad ?? 0);
      }
    }

    // ── Criterio PRECIO ────────────────────────────────────────────────────
    if (orden.criterioActivo === "precio") {
      const precioA = Number(a.precio) || 0;
      const precioB = Number(b.precio) || 0;
      const factor = orden.precio === "menor-a-mayor" ? 1 : -1;
      return (precioA - precioB) * factor;
    }

    // ── Criterio SUPERFICIE ────────────────────────────────────────────────
    if (orden.criterioActivo === "superficie") {
      const supA = Number(a.superficieM2) || 0;
      const supB = Number(b.superficieM2) || 0;
      const factor = orden.superficie === "menor-a-mayor" ? 1 : -1;
      return (supA - supB) * factor;
    }

    return 0;
  });
}
