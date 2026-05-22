'use client'

import React, { Suspense } from 'react'
import FilterBar from '@/components/filters/FilterBar'

// Definimos exactamente lo que el FilterBar envía para que TS no llore
interface FiltrosInput {
  tipoInmueble: string[]
  modoInmueble: string[]
  query: string
  updatedAt?: string
}

// 1. Aislamos la lógica y el FilterBar en un componente interno
function FiltersContent() {
  const handleSearch = (filtros: FiltrosInput) => {
    const params = new URLSearchParams()

    // Mapeo de los nuevos nombres a los parámetros de tu API
    filtros.tipoInmueble?.forEach((t) => params.append('categoria', t))
    filtros.modoInmueble?.forEach((m) => params.append('tipoAccion', m))
    if (filtros.query) params.append('query', filtros.query)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/properties/search?${params.toString()}`)
        const data = await response.json()
        console.log('Resultados:', data)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchData()
  }

  return <FilterBar onSearch={handleSearch} />
}

// 2. Exportamos la página principal envolviendo el contenido con Suspense
export default function FiltersPage() {
  return (
    <div className="flex flex-col items-center pt-32 px-4">
      <Suspense fallback={
        <div className="w-full max-w-[921px] h-[100px] animate-pulse bg-gray-200 rounded-3xl flex items-center justify-center text-gray-400">
          Cargando buscador...
        </div>
      }>
        <FiltersContent />
      </Suspense>
    </div>
  )
}