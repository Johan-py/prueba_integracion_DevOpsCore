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

  // tipoInmueble: ignorar si es "CUALQUIER TIPO" o vacío
  const tipo = filtros.tipoInmueble?.[0]
  if (tipo && tipo !== 'CUALQUIER TIPO' && tipo !== '') {
    params.set('categoria', tipo)
  }

  // modoInmueble: el backend acepta un solo tipoAccion
  // Si el usuario eligió varios modos, mandamos el primero.
  // El backend filtra por VENTA | ALQUILER | ANTICRETO
  const modo = filtros.modoInmueble?.[0]
  if (modo && modo !== '') {
    params.set('tipoAccion', modo)
  }

  return params
}

export const ResultadosBusqueda = () => {
  const [inmueblesRaw, setInmueblesRaw] = useState<Inmueble[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  const { ordenActual, cambiarOrden, inmueblesOrdenados } = useOrdenamiento({
    inmuebles: inmueblesRaw
  })

  useEffect(() => {
    // Función reutilizable para hacer el fetch con filtros
    function fetchInmuebles() {
      setCargando(true)
      setError(false)

      const filtros = leerFiltrosGuardados()
      const params = construirParams(filtros)
      const url = `http://localhost:5000/api/inmuebles${params.toString() ? `?${params}` : ''}`

      console.log('Fetch con filtros:', url)

      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('Error de red')
          return res.json()
        })
        .then((data) => {
          if (data.ok) setInmueblesRaw(data.data)
          else setError(true)
        })
        .catch(() => setError(true))
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
          {inmueblesOrdenados.map((inmueble) => (
            <TarjetaInmueble key={inmueble.id} inmueble={inmueble} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron propiedades.</p>
        </div>
      )}
    </div>
  )
}
