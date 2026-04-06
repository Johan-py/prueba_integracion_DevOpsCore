'use client'

import { useState, useEffect } from 'react'
import { useOrdenamiento } from '../../hooks/useOrdenamiento'
import { MenuOrdenamiento } from './ordenamiento/MenuOrdenamiento'
import { TarjetaInmueble } from './TarjetaInmueble'
import { Inmueble } from '../../types/inmueble'

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
  const [inmueblesRaw, setInmueblesRaw] = useState<Inmueble[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const { ordenActual, cambiarOrden, inmueblesOrdenados } = useOrdenamiento({
    inmuebles: inmueblesRaw as unknown as any[]
  })
  useEffect(() => {
    // Función reutilizable para hacer el fetch con filtros
    function fetchInmuebles() {
      setCargando(true)
      setError(false)

      const filtros = leerFiltrosGuardados()
      const params = construirParams(filtros)

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const queryStr = params.toString() ? `?${params.toString()}` : ''
      const url = `${API_BASE}/api/properties/inmuebles${queryStr}`

      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('Error de red')
          return res.json()
        })
        .then((data) => {
          // Ajustamos según la respuesta de tu API (data.ok o data directo)
         if (data && data.ok === true && Array.isArray(data.data)) {
            console.log("✅ Datos recibidos con éxito:", data.data.length);
            setInmueblesRaw(data.data); // Guardamos solo el arreglo de inmuebles
          } else {
            console.error("❌ Formato de datos inesperado:", data);
            setError(true);
          }
        })
        .finally(() => setCargando(false))
    }

    // Carga inicial
    fetchInmuebles()

    // Escuchar actualizaciones de filtros desde FilterBar
    window.addEventListener('filterUpdate', fetchInmuebles)
    return () => window.removeEventListener('filterUpdate', fetchInmuebles)
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────────

  if (cargando) return <p className="p-8 text-gray-500">Cargando propiedades...</p>

  if (error)
    return (
      <p className="p-8 text-red-400">
        No se pudieron cargar las propiedades. Intenta recargar la página.
      </p>
    )

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MenuOrdenamiento
        ordenActual={ordenActual}
        onOrdenChange={cambiarOrden}
        totalResultados={inmueblesOrdenados.length}
      />
      {inmueblesOrdenados.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {inmueblesOrdenados.map((item: unknown) => {
            const inmueble = item as Inmueble
            return <TarjetaInmueble key={inmueble.id} inmueble={inmueble} />
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron propiedades.</p>
        </div>
      )}
    </div>
  )
}
