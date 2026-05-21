'use client'

import { useCallback, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export function usePropertySearch() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  
  // Obtenemos los parámetros reactivamente desde la URL
  const searchParams = useSearchParams()

  const searchProperties = useCallback(async () => {
    if (!searchParams) return;

    // Construimos los parámetros que enviaremos a Express
    const backendParams = new URLSearchParams()

    // Mapeo: tipoInmueble (URL Frontend) -> categoria (URL Backend)
    const tipoInmueble = searchParams.getAll('tipoInmueble')
    if (tipoInmueble.length > 0) {
      tipoInmueble.forEach((tipo) => backendParams.append('categoria', tipo))
    }

    // Mapeo: modoInmueble (URL Frontend) -> tipoAccion (URL Backend)
    const modoInmueble = searchParams.getAll('modoInmueble')
    if (modoInmueble.length > 0) {
      modoInmueble.forEach((modo) => backendParams.append('tipoAccion', modo))
    }

    // Mapeo directo de IDs y texto
    const locationId = searchParams.get('locationId')
    if (locationId) backendParams.append('locationId', locationId)

    // Mapeo: query (URL Frontend) -> search (URL Backend)
    const query = searchParams.get('query')
    if (query) backendParams.append('search', query)

    // Empaquetar las coordenadas para el backend
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius')
    
    if (lat) backendParams.append('lat', lat)
    if (lng) backendParams.append('lng', lng)
    if (radius) backendParams.append('radius', radius)

    // HU6: Amenities y Labels (el nuevo useSearchFilters los guarda como array de params)
    const amenities = searchParams.getAll('amenities')
    if (amenities.length > 0) {
      backendParams.append('amenities', amenities.join(','))
    }

    const labels = searchParams.getAll('labels')
    if (labels.length > 0) {
      backendParams.append('labels', labels.join(','))
    }

    try {
      setLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      
      // Hacemos el fetch con la cadena limpia
      const res = await fetch(`${API_URL}/api/properties/search?${backendParams.toString()}`)
      const json = await res.json()
      
      setData(json.data || json)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }, [searchParams]) // Reactividad: Se actualiza si cambian los parámetros en la URL

  return {
    data,
    loading,
    searchProperties
  }
}