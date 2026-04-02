import { useState, useEffect } from 'react'
import { PropertyMapPin } from '@/types/property'
import { MOCK_PROPERTIES } from '@/data/mockProperties'

// Para conectar la BD real, solo hay que:
// 1. Cambiar USE_MOCK a false
// 2. Asegurarse de que NEXT_PUBLIC_API_URL esté en .env.local

const USE_MOCK = true
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface UsePropertiesResult {
  properties: PropertyMapPin[]
  isLoading: boolean
  error: string | null
}

export function useProperties(): UsePropertiesResult {
  const [properties, setProperties] = useState<PropertyMapPin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchProperties() {
      setIsLoading(true)
      setError(null)

      try {
        if (USE_MOCK) {
          // Simula latencia de red para que el loading state se vea real
          await new Promise((resolve) => setTimeout(resolve, 400))
          if (!cancelled) setProperties(MOCK_PROPERTIES)
        } else {
          const res = await fetch(`${API_URL}/api/properties/map`)
          if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
          const json = await res.json()
          if (!cancelled) setProperties(json.data)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchProperties()
    return () => {
      cancelled = true
    }
  }, [])

  return { properties, isLoading, error }
}
