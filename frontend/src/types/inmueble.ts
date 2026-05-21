export interface Inmueble {
  id: number
  titulo: string
  precio: number | string
  superficieM2?: number | null
  ubicacion?: {
    zona?: string
    ciudad?: string
    direccion?: string | null
  } | null
  nroCuartos?: number | null
  nroBanos?: number | null
  fechaPublicacion: string
  popularidad?: number
  estado?: string
  tipoAccion?: string
  categoria?: string | null
}

export type OrdenFecha =
  | 'mas-recientes'
  | 'mas-populares'
  | 'mas-antiguos'
  | 'mas-recomendados'
  | 'mayor-descuento'
export type OrdenDireccion = 'menor-a-mayor' | 'mayor-a-menor'

// Qué criterio está manejando el usuario en este momento.
// null = nadie tocó nada todavía → se aplica el default (fecha más recientes)
export type CriterioActivo = 'fecha' | 'precio' | 'superficie' | 'recomendados' | null

export interface EstadoOrdenamiento {
  fecha: OrdenFecha
  precio: OrdenDireccion
  superficie: OrdenDireccion
  criterioActivo: CriterioActivo // <-- nuevo campo
}

export const OPCIONES_FECHA: Array<{ value: OrdenFecha; label: string }> = [
  { value: 'mas-recientes', label: 'Más recientes' },
  { value: 'mas-antiguos', label: 'Más antiguos' },
  { value: 'mas-populares', label: 'Más populares' },
  { value: 'mas-recomendados', label: 'Más recomendados' },
  { value: 'mayor-descuento', label: 'Mayor descuento' }
]

export const OPCIONES_DIRECCION: Array<{
  value: OrdenDireccion
  label: string
}> = [
  { value: 'menor-a-mayor', label: 'Menor a Mayor' },
  { value: 'mayor-a-menor', label: 'Mayor a Menor' }
]

export const ORDENAMIENTO_DEFAULT: EstadoOrdenamiento = {
  fecha: 'mas-recientes',
  precio: 'menor-a-mayor',
  superficie: 'menor-a-mayor',
  criterioActivo: null // null = default, ordenar por fecha reciente
}
