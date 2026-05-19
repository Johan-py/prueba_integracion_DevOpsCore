'use client'

import React, { useState, useEffect } from 'react'
import { Trash2, Pencil, Check, X, Loader2, MapPin, Plus, Eye, EyeOff, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import nextDynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const MapaZonas = nextDynamic(() => import('./MapaZonas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-stone-100 animate-pulse flex items-center justify-center text-stone-400 text-sm">
      Cargando mapa...
    </div>
  ),
})

// Tipo Zona que coincide con el esperado por MapaZonas
interface Zona {
  id: number
  nombre: string
  referencia: string
  mostrarPropiedades: boolean // Cambiado de 'activa' a 'mostrarPropiedades'
  geometria?: any
  coordenadas?: { lat: number; lng: number; zoom: number }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function MisZonas() {
  const router = useRouter()
  const [zonas, setZonas] = useState<Zona[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [nombreEditado, setNombreEditado] = useState('')
  const [referenciaEditada, setReferenciaEditada] = useState('')
  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [zonaSeleccionadaId, setZonaSeleccionadaId] = useState<number | null>(null)
 
  const getToken = () => localStorage.getItem('token')

  // Extraer coordenadas del centro del polígono real
  const extraerCoordenadasDeGeometria = (geometria: any): { lat: number; lng: number; zoom: number } => {
    if (!geometria) {
      return { lat: -17.3895, lng: -66.1568, zoom: 14 }
    }

    try {
      if (geometria.type === 'Polygon' && geometria.coordinates?.[0]?.length > 0) {
        const coords = geometria.coordinates[0]
        const lats = coords.map((c: number[]) => c[1])
        const lngs = coords.map((c: number[]) => c[0])
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2
        return { lat: centerLat, lng: centerLng, zoom: 13 }
      }

      if (geometria.type === 'Point' && geometria.coordinates) {
        return { lat: geometria.coordinates[1], lng: geometria.coordinates[0], zoom: 15 }
      }
    } catch (e) {
      console.error('Error extrayendo coordenadas:', e)
    }

    return { lat: -17.3895, lng: -66.1568, zoom: 14 }
  }

  const cargarZonas = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getToken()
      if (!token) {
        router.replace('/sign-in')
        return
      }

      const response = await fetch(`${API_URL}/api/perfil/zonas`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // El backend devuelve directamente el array de zonas
      const zonasData = Array.isArray(data) ? data : []

      // Transformar datos del backend al formato que espera el frontend
      const zonasTransformadas: Zona[] = zonasData.map((zona: any) => ({
        id: zona.id,
        nombre: zona.nombre,
        referencia: zona.descripcion || 'Sin referencia',
        mostrarPropiedades: false, // Por defecto no mostrar propiedades
        geometria: zona.geometria,
        coordenadas: extraerCoordenadasDeGeometria(zona.geometria)
      }))

      setZonas(zonasTransformadas)
    } catch (err: any) {
      console.error('Error cargando zonas:', err)
      setError(err.message || 'Error al cargar las zonas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarZonas()
  }, [])

  const toggleMostrarPropiedades = (zonaId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setZonaSeleccionadaId(zonaId)
    setZonas(prev => prev.map(zona =>
      zona.id === zonaId
        ? { ...zona, mostrarPropiedades: !zona.mostrarPropiedades }
        : zona
    ))
  }

  const iniciarEdicion = (zona: Zona, event: React.MouseEvent) => {
    event.stopPropagation()
    setEditandoId(zona.id)
    setNombreEditado(zona.nombre)
    setReferenciaEditada(zona.referencia)
  }

  const guardarEdicion = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation()
    if (!nombreEditado.trim()) return

    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) throw new Error('No autenticado')

      const response = await fetch(`${API_URL}/api/perfil/zonas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: nombreEditado,
          descripcion: referenciaEditada
        })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar')
      }

      const zonaActualizada = await response.json()

      setZonas(prev => prev.map(z =>
        z.id === id
          ? {
            ...z,
            nombre: zonaActualizada.nombre,
            referencia: zonaActualizada.descripcion || 'Sin referencia'
          }
          : z
      ))

      setEditandoId(null)
    } catch (err: any) {
      console.error('Error actualizando:', err)
      alert(err.message || 'Error al actualizar zona')
    } finally {
      setIsLoading(false)
    }
  }

  const cancelarEdicion = (event: React.MouseEvent) => {
    event.stopPropagation()
    setEditandoId(null)
    setNombreEditado('')
    setReferenciaEditada('')
  }

  const eliminarZona = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) throw new Error('No autenticado')

      const response = await fetch(`${API_URL}/api/perfil/zonas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Error al eliminar')
      }

      setZonas(prev => prev.filter(z => z.id !== id))
      setConfirmandoEliminarId(null)
    } catch (err: any) {
      console.error('Error eliminando:', err)
      alert(err.message || 'Error al eliminar zona')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditandoId(null)
      setNombreEditado('')
      setReferenciaEditada('')
    }
  }

  // Obtener IDs de zonas donde mostrar propiedades
  const zonasConPropiedades = zonas
    .filter(zona => zona.mostrarPropiedades)
    .map(zona => zona.id)

  if (isLoading && zonas.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Mis Zonas</h1>
          <p className="text-sm text-stone-500 mt-1">
            Todas tus zonas se muestran en el mapa. Activa el checkbox para ver las propiedades dentro de cada zona.
          </p>
        </div>
        <Link
          href="/estadisticas-zona"
          id="btn-estadisticas-propiedades"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E07B2A] text-white text-sm font-semibold hover:bg-[#c96a1d] transition-colors shadow-sm whitespace-nowrap self-start"
        >
          <BarChart2 size={16} />
          Estadísticas de propiedades
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
          <button
            onClick={cargarZonas}
            className="ml-3 text-red-700 underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* MAPA */}
        <div className="w-full lg:w-3/5 bg-white border border-[#e5dfd7] rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5dfd7]">
            <h2 className="font-semibold text-stone-800">Mapa</h2>
            <div className="text-sm text-stone-500">
              {zonasConPropiedades.length} zona(s) con propiedades visibles
            </div>
          </div>
          <div className="relative w-full overflow-hidden" style={{ height: '420px', zIndex: 0 }}>
            <MapaZonas
              zonas={zonas}
              zonasConPropiedades={zonasConPropiedades}
              zonaSeleccionadaId={zonaSeleccionadaId}
            />
          </div>
        </div>

        {/* LISTA */}
        <div className="w-full lg:w-2/5 bg-white border border-[#e5dfd7] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e5dfd7]">
            <h2 className="font-semibold text-stone-800">Mis zonas guardadas</h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Activa el checkbox para ver las propiedades dentro de cada zona en el mapa.
            </p>
          </div>
          <div className="p-4 flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: '460px' }}>
            {zonas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-stone-400 gap-2">
                <MapPin size={36} strokeWidth={1} />
                <p className="text-sm">No tienes zonas guardadas.</p>
                <p className="text-xs">Las zonas se crean desde el mapa dibujando un polígono.</p>
              </div>
            ) : (
              zonas.map((zona) => (
                <div
                  key={zona.id}
                  className={`rounded-xl border p-4 transition-all
                    ${zona.mostrarPropiedades
                      ? 'border-amber-400 bg-amber-50 shadow-sm'
                      : 'border-[#e5dfd7] bg-white hover:border-amber-300 hover:bg-stone-50'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      {editandoId === zona.id ? (
                        <div className="space-y-2">
                          <input
                            autoFocus
                            type="text"
                            value={nombreEditado}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setNombreEditado(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full px-2 py-1 text-sm border border-amber-500 rounded bg-white focus:outline-none"
                            placeholder="Nombre"
                          />
                          <input
                            type="text"
                            value={referenciaEditada}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setReferenciaEditada(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full px-2 py-1 text-xs border border-stone-300 rounded bg-white focus:outline-none focus:border-amber-500"
                            placeholder="Referencia"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="font-semibold text-stone-800 text-sm truncate">{zona.nombre}</p>
                          <p className="text-xs text-stone-500 mt-0.5 truncate">{zona.referencia}</p>
                        </>
                      )}
                    </div>
                    {zona.mostrarPropiedades && (
                      <span className="shrink-0 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Eye size={10} /> Propiedades visibles
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {editandoId === zona.id ? (
                      <>
                        <button onClick={(e) => guardarEdicion(zona.id, e)} className="flex items-center gap-1 px-3 py-1 text-xs border border-green-400 text-green-600 hover:bg-green-50 rounded-md">
                          <Check size={12} /> Guardar
                        </button>
                        <button onClick={cancelarEdicion} className="flex items-center gap-1 px-3 py-1 text-xs border border-stone-300 text-stone-500 rounded-md">
                          <X size={12} /> Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => iniciarEdicion(zona, e)} className="flex items-center gap-1 px-3 py-1 text-xs border border-stone-300 text-stone-600 hover:border-amber-400 hover:text-amber-600 rounded-md transition-colors">
                          <Pencil size={12} /> Editar
                        </button>
                        {confirmandoEliminarId === zona.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-stone-500">¿Eliminar?</span>
                            <button onClick={(e) => eliminarZona(zona.id, e)} className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md">Sí</button>
                            <button onClick={(e) => { e.stopPropagation(); setConfirmandoEliminarId(null) }} className="px-2 py-1 text-xs border border-stone-300 text-stone-500 rounded-md">No</button>
                          </div>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); setConfirmandoEliminarId(zona.id) }} className="flex items-center gap-1 px-3 py-1 text-xs border border-stone-300 text-stone-600 hover:border-red-400 hover:text-red-500 rounded-md transition-colors">
                            <Trash2 size={12} /> Eliminar
                          </button>
                        )}
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-xs text-stone-400">
                            {zona.mostrarPropiedades ? <Eye size={12} /> : <EyeOff size={12} />}
                          </span>
                          <input
                            type="checkbox"
                            checked={zona.mostrarPropiedades}
                            onChange={() => { }}
                            onClick={(e) => toggleMostrarPropiedades(zona.id, e)}
                            className="accent-amber-500 w-4 h-4 cursor-pointer"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}