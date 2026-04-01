'use client'

import { useCallback, useState } from 'react'
import { GlobalFilters } from '@/types/filters'

export function usePropertySearch() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const searchProperties = useCallback(async () => {
    const saved = sessionStorage.getItem('propbol_global_filters')
    if (!saved) return

    const filters: GlobalFilters = JSON.parse(saved)
    const params = new URLSearchParams()

    if (filters.tipoInmueble && filters.tipoInmueble.length > 0) {
      filters.tipoInmueble.forEach((tipo) => {
        params.append('categoria', tipo)
      })
    }

    if (filters.modoInmueble && Array.isArray(filters.modoInmueble)) {
      filters.modoInmueble.forEach((modo) => {
        params.append('tipoAccion', modo)
      })
    }

    try {
      setLoading(true)
      // 4. Petición al backend local [cite: 409-410]
      const res = await fetch(`http://localhost:5000/api/properties/search?${params.toString()}`)

      const json = await res.json()

      setData(json.data || json)
    } catch (error) {
      console.error('Error en la búsqueda de PropBol:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  return {
    data,
    loading,
    searchProperties
  }
}
