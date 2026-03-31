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

export type OrdenFecha = 'mas-recientes' | 'mas-populares' | 'mas-antiguos'
export type OrdenDireccion = 'menor-a-mayor' | 'mayor-a-menor'

export interface EstadoOrdenamiento {
  fecha: OrdenFecha
  precio: OrdenDireccion
  superficie: OrdenDireccion
}

export const OPCIONES_FECHA: Array<{ value: OrdenFecha; label: string }> = [
  { value: 'mas-recientes', label: 'Más recientes' },
   { value: 'mas-antiguos', label: 'Más antiguos' },
  { value: 'mas-populares', label: 'Más populares' }
]

export const OPCIONES_DIRECCION: Array<{ value: OrdenDireccion; label: string }> = [
  { value: 'menor-a-mayor', label: 'Menor a Mayor' },
  { value: 'mayor-a-menor', label: 'Mayor a Menor' }
]

export const ORDENAMIENTO_DEFAULT: EstadoOrdenamiento = {
  fecha: 'mas-recientes',
  precio: 'menor-a-mayor',
  superficie: 'menor-a-mayor'
}
