// -- BitPro
import { GlobalFilters } from '../types/filters'

export const useSearchFilters = () => {
  const updateFilters = (newFilter: Partial<GlobalFilters>) => {
    // 1. Leemos los filtros actuales (si es que hay)
    const currentFilters: GlobalFilters = JSON.parse(
      sessionStorage.getItem('propbol_global_filters') || '{}'
    )

    // 2. Creamos un nuevo objeto con los filtros actualizados
    const updated = {
      ...currentFilters,
      ...newFilter,
      updatedAt: new Date().toISOString()
    }

    // 3. Guardamos en sessionStorage (podría ser localStorage, pero queremos que se resetee al cerrar la pestaña)
    sessionStorage.setItem('propbol_global_filters', JSON.stringify(updated))

    window.dispatchEvent(new Event('filterUpdate'))
  }

  return { updateFilters }
}
