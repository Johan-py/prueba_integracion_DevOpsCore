export type BlogStatus =
  | 'Aprobado'
  | 'Pendiente'
  | 'Rechazado'
  | 'Borrador'
  | 'PUBLICADO'
  | 'PENDIENTE'
  | 'RECHAZADO'
  | 'BORRADOR'

export interface Blog {
  id: number | string
  titulo: string
  fecha: string
  estado: BlogStatus
  imagenUrl: string
  autor?: string
  resumen?: string
}
