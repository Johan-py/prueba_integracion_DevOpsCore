'use client'

import { useState, useEffect } from 'react'
import { useOrdenamiento } from '../../hooks/useOrdenamiento'
import { MenuOrdenamiento } from './ordenamiento/MenuOrdenamiento'
import { TarjetaInmueble } from './TarjetaInmueble'
import { Inmueble } from '../../types/inmueble'
import { useSearchParams } from 'next/navigation'

// ── Tipos de filtros globales (los que guarda FilterBar) ──────────────────────
interface FiltrosGlobales {
  tipoInmueble?: string[] // ej: ["CASA"] o ["CUALQUIER TIPO"]
  modoInmueble?: string[] // ej: ["VENTA"] o ["VENTA", "ALQUILER"]
  query?: string
  locationId?: number
  updatedAt?: string
}

// ── Leer filtros de sessionStorage de forma segura ────────────────────────────
function leerFiltrosGuardados(): FiltrosGlobales {
  try {
    const raw = sessionStorage.getItem('propbol_global_filters')
    if (!raw) return {}
    return JSON.parse(raw) as FiltrosGlobales
  } catch {
    return {}
  }
}

// ── Construir query params para el backend ────────────────────────────────────
function construirParams(filtros: FiltrosGlobales): URLSearchParams {
  const params = new URLSearchParams()

  // 🚀 Mapeamos con el nombre correcto que espera el backend (tipoInmueble)
  const tipo = filtros.tipoInmueble?.[0]
  if (tipo && tipo !== 'CUALQUIER TIPO' && tipo !== '') {
    params.set('tipoInmueble', tipo)
  }

  // 🚀 Mapeamos con el nombre correcto (modoInmueble)
  const modo = filtros.modoInmueble?.[0]
  if (modo && modo !== '') {
    params.set('modoInmueble', modo)
  }

  // 🚀 AÑADIMOS LA UBICACIÓN (La razón de los 0 resultados)
  if (filtros.locationId) {
    params.set('locationId', filtros.locationId.toString())
  }
  if (filtros.query) {
    params.set('query', filtros.query)
  }

  return params
}

export const ResultadosBusqueda = () => {
  const searchParams = useSearchParams()
  const [inmueblesRaw, setInmueblesRaw] = useState<Inmueble[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const { ordenActual, cambiarOrden, inmueblesOrdenados } = useOrdenamiento({
    inmuebles: inmueblesRaw as unknown as any[]
  })
 useEffect(() => {
  console.log('🔄 searchParams:', searchParams.toString()) // temporal
  const fetchInmuebles = async () => {
    setCargando(true)
    setError(false)
    try {
      // Verificar si hay recomendaciones guardadas (viene del botón FilterBar)
      const orden = searchParams.get('orden')
      if (orden === 'recomendados') {
        const cached = sessionStorage.getItem('recomendaciones_resultado')
        if (cached) {
          setInmueblesRaw(JSON.parse(cached))
          sessionStorage.removeItem('recomendaciones_resultado')
          setCargando(false)
          return
        }
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : ''
      const url = `${API_BASE}/api/properties/inmuebles${queryStr}`

      const res = await fetch(url)
      if (!res.ok) throw new Error('Error de red al conectar con el servidor')

      const data = await res.json()

      if (data && data.ok === true && Array.isArray(data.data)) {
        console.log('✅ Datos recibidos con éxito:', data.data.length)
        setInmueblesRaw(data.data)
      } else {
        console.error('❌ Formato de datos inesperado:', data)
        setInmueblesRaw([])
        setError(true)
      }
    } catch (err) {
      console.error('Error en fetchInmuebles:', err)
      setInmueblesRaw([])
      setError(true)
    } finally {
      setCargando(false)
    }
  }
  fetchInmuebles()
}, [searchParams.toString()])
  // ── Render ──────────────────────────────────────────────────────────────────

  if (cargando) return <p className="p-8 text-gray-500">Cargando propiedades...</p>

  if (error)
    return (
      <p className="p-8 text-red-400">
        No se pudieron cargar las propiedades. Intenta recargar la página.
      </p>
    )
  const handleOrdenChange = async (nuevoOrden: any) => {
  if (nuevoOrden.criterioActivo === 'recomendados') {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        cambiarOrden(nuevoOrden)
        return
      }

      const ids = inmueblesRaw.map((i: any) => i.id)
      const res = await fetch('/api/recomendaciones/ordenar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ inmuebleIds: ids })
      })

      const data = await res.json()
      if (data.success && data.data.length > 0) {
        setInmueblesRaw(data.data)
      }
    } catch (error) {
      console.error('Error ordenando por afinidad:', error)
      cambiarOrden(nuevoOrden)
    }
  } else {
    cambiarOrden(nuevoOrden)
  }
}
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MenuOrdenamiento
        ordenActual={ordenActual}
        onOrdenChange={handleOrdenChange}
        totalResultados={inmueblesOrdenados.length}
      />
      {inmueblesOrdenados.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {inmueblesOrdenados.map((item: unknown, index: number) => {
            const inmueble = item as Inmueble
       return (
        <TarjetaInmueble 
        key={inmueble.id} 
        inmueble={inmueble} 
        posicion={index + 1}
        esRecomendadoIA={searchParams.get('orden') === 'recomendados'}
       />
     )  })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron propiedades.</p>
        </div>
      )}
    </div>
  )
}
