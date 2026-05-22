// -- BitPro
import { useRouter } from 'next/navigation'
import { GlobalFilters } from '../types/filters'

const FILTER_KEY = 'propbol_global_filters'

export const FILTROS_URL_KEYS = [
  'lat', 'lng', 'radio',
  'departamentoId', 'provinciaId', 'municipioId', 'zonaId', 'barrioId',
  'precioMin', 'precioMax', 'currency',
  'dormitoriosMin', 'dormitoriosMax', 'banosMin', 'banosMax', 'tipoBano',
  'minSuperficie', 'maxSuperficie',
  'tipo', 'categoria', 'q',
  'amenities', 'labels',
] as const

export const UBICACION_URL_KEYS = [
  'lat', 'lng', 'radio',
  'departamentoId', 'provinciaId', 'municipioId', 'zonaId', 'barrioId',
] as const

export type BusquedaModo = 'general' | 'especifica'

export const useSearchFilters = () => {

  const updateFilters = (newFilter: Partial<GlobalFilters>) => {
    const currentFilters: GlobalFilters = JSON.parse(
      sessionStorage.getItem(FILTER_KEY) || '{}'
    )
    const updated = {
      ...currentFilters,
      ...newFilter,
      updatedAt: new Date().toISOString()
    }
    sessionStorage.setItem(FILTER_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('filterUpdate'))
  }

  // AC 1 & 8
  const getBusquedaModo = (searchParams: URLSearchParams): BusquedaModo => {
    const tieneUbicacion = UBICACION_URL_KEYS.some((key) => searchParams.has(key))
    return tieneUbicacion ? 'especifica' : 'general'
  }

  const cambiarAModoGeneral = (
    router: ReturnType<typeof useRouter>,
    currentParams: URLSearchParams
  ) => {
    const newParams = new URLSearchParams(currentParams.toString())
    UBICACION_URL_KEYS.forEach((key) => newParams.delete(key))
    router.push(`/busqueda_mapa?${newParams.toString()}`)
    window.dispatchEvent(new Event('filterUpdate'))
  }
   const removeFilter = (
    router: ReturnType<typeof useRouter>,
    currentParams: URLSearchParams,
    keys: string | string[]
  ) => {
    const newParams = new URLSearchParams(currentParams.toString())
    const toDelete = Array.isArray(keys) ? keys : [keys]
    toDelete.forEach((k) => newParams.delete(k))
    router.push(`/busqueda_mapa?${newParams.toString()}`)
    window.dispatchEvent(new Event('filterUpdate'))
  }
  // AC 3, 4, 6, 10
  const clearAllFilters = (
    router: ReturnType<typeof useRouter>,
    currentParams: URLSearchParams
  ) => {
    sessionStorage.removeItem(FILTER_KEY)
    sessionStorage.removeItem('propbol_modo_recomendados')
    sessionStorage.removeItem('propbol_recomendados')
    const newParams = new URLSearchParams(currentParams.toString())
    FILTROS_URL_KEYS.forEach((key) => newParams.delete(key))
    router.push(`/busqueda_mapa?${newParams.toString()}`)
    window.dispatchEvent(new Event('filterUpdate'))
  }

  const getActiveFilterCount = (searchParams: URLSearchParams): number => {
    return FILTROS_URL_KEYS.filter((key) => searchParams.has(key)).length
  }


  return {
    updateFilters,
    getBusquedaModo,
    cambiarAModoGeneral,
    removeFilter,
    clearAllFilters,      
    getActiveFilterCount,
  }
}