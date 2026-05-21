import { useState, useEffect, useCallback } from 'react'
import type { ZonaPredefinida } from '@/types/zona'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 3000

export function useZonas() {
  const [zonas, setZonas] = useState<ZonaPredefinida[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchZonas = useCallback((retries = 0) => {
    setIsLoading(true)
    fetch(`${API_URL}/api/zonas`)
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`)
        return res.json()
      })
      .then((json) => {
        setZonas(json.data ?? [])
        setIsLoading(false)
      })
      .catch(() => {
        if (retries < MAX_RETRIES) {
          setTimeout(() => fetchZonas(retries + 1), RETRY_DELAY_MS)
        } else {
          setZonas([]) // criterio 4: array vacío → mapa carga sin errores
          setIsLoading(false)
        }
      })
  }, [])

  useEffect(() => {
    fetchZonas()
  }, [fetchZonas])

  return { zonas, isLoading }
}
