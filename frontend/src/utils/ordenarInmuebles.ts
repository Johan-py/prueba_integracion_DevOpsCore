import { Inmueble, EstadoOrdenamiento } from '../types/inmueble'

export function ordenarInmuebles(inmuebles: Inmueble[], orden: EstadoOrdenamiento): Inmueble[] {
  return [...inmuebles].sort((a, b) => {
    if (orden.fecha === 'mas-recientes') {
      const diff = new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime()
      if (diff !== 0) return diff
    } else if (orden.fecha === 'mas-antiguos') {
      const diff = new Date(a.fechaPublicacion).getTime() - new Date(b.fechaPublicacion).getTime()
      if (diff !== 0) return diff
    } else {
      const popA = a.popularidad ?? 0
      const popB = b.popularidad ?? 0
      if (popA !== popB) return popB - popA
    }

    const factorPrecio = orden.precio === 'menor-a-mayor' ? 1 : -1
    const precioA = Number(a.precio)
    const precioB = Number(b.precio)
    if (precioA !== precioB) return (precioA - precioB) * factorPrecio

    const factorSup = orden.superficie === 'menor-a-mayor' ? 1 : -1
    const supA = Number(a.superficieM2 ?? 0)
    const supB = Number(b.superficieM2 ?? 0)
    return (supA - supB) * factorSup
  })
}
