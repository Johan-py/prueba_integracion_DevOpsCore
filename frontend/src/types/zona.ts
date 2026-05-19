export type TipoZona = "predefinida" | "personalizada";

export interface ZonaPredefinida {
  id: number;
  nombre: string;
  coordenadas: [number, number][];
  color: string;
  activa: boolean;
  creadoEn: string;
  tipo?: TipoZona; // Tipo de zona para diferenciar visualmente
}

/**
 * Paleta de colores para zonas
 * HU10: Diferenciación visual de zonas predefinidas vs personalizadas
 */
export const ZONA_COLORS = {
  predefinida: {
    // Estado inactivo
    borderInactive: "#d97706", // Naranja (coherente con paleta)
    fillInactive: "#ea580c", // Naranja más oscuro
    fillOpacityInactive: 0.12,
    // Estado activo (seleccionado)
    borderActive: "#d97706",
    fillActive: "#ea580c",
    fillOpacityActive: 0.28,
    labelColor: "#ea580c",
    labelColorSelected: "#ea580c",
  },
  personalizada: {
    // Estado inactivo
    borderInactive: "#16a34a", // Verde (identifica zonas del usuario)
    fillInactive: "#22c55e", // Verde más claro
    fillOpacityInactive: 0.12,
    // Estado activo (seleccionado)
    borderActive: "#16a34a",
    fillActive: "#22c55e",
    fillOpacityActive: 0.28,
    labelColor: "#15803D",
    labelColorSelected: "#15803D",
  },
} as const;
