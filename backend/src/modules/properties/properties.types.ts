export interface Property {
  id: number;
  categoria: string;
  tipoAccion: string;
  ubicacion: {
    ciudad: string;
  };
}

export interface PropertyFilters {
  categoria?: string;
  tipoAccion?: string;
  ciudad?: string;
}