'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Search } from 'lucide-react'

export interface Etiqueta {
  id: string
  nombre: string
  color?: string
  cantidad?: number 
}

type EtiquetaApi = {
  id: number
  nombre: string
  cantidad?: number | null
}

interface EtiquetasSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const DEFAULT_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
]

const getFallbackColor = (nombre: string) => {
  let hash = 0
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
  }
  return DEFAULT_COLORS[Math.abs(hash) % DEFAULT_COLORS.length]
}

export default function EtiquetasSidebar({ isOpen, onClose }: EtiquetasSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [etiquetasDB, setEtiquetasDB] = useState<Etiqueta[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showEmptyWarning, setShowEmptyWarning] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const fetchEtiquetas = async () => {
      setIsLoading(true)
      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')
        const res = await fetch(`${API_URL}/api/tags`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`Error ${res.status}`)     
        const json = await res.json()

        const etiquetas: Etiqueta[] = (json.data || []).map((item: EtiquetaApi) => ({
          id: String(item.id),
          nombre: item.nombre?.trim() ?? '',
          color: getFallbackColor(item.nombre?.trim() ?? ''),
          cantidad: item.cantidad ?? undefined
        }))

        setEtiquetasDB(etiquetas)

        const nombresMap: Record<string, string> = {}
        etiquetas.forEach((e) => {
          nombresMap[e.id] = e.nombre
        })
        sessionStorage.setItem(
          'propbol_etiquetas_nombres',
          JSON.stringify(nombresMap)
        )
      } catch (error) {
        console.error('Error cargando etiquetas:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEtiquetas()
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      const urlLabels = searchParams.get('labels')?.split(',').filter(Boolean) || []
      setSelectedIds(urlLabels)
      setSearchQuery('')
    }
  }, [isOpen, searchParams])

  // Seleccionadas: etiquetas con datos completos
  const selectedEtiquetas = useMemo(
    () => etiquetasDB.filter(e => selectedIds.includes(e.id)),
    [etiquetasDB, selectedIds]
  )

  const availableEtiquetas = useMemo(() => {
    const sinSeleccionadas = etiquetasDB.filter((e) => !selectedIds.includes(e.id))
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return sinSeleccionadas.filter(e => e.cantidad === undefined || e.cantidad > 0)
    }
    return sinSeleccionadas.filter((e) => e.nombre.toLowerCase().includes(query))
  }, [etiquetasDB, selectedIds, searchQuery])

  if (!isOpen) return null

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleApply = () => {
    if (selectedIds.length === 0) {
      setShowEmptyWarning(true)
      setTimeout(() => setShowEmptyWarning(false), 2500)
      return
    }
    const params = new URLSearchParams(searchParams.toString())
    params.set('labels', selectedIds.join(','))
    router.push(`/busqueda_mapa?${params.toString()}`)
    onClose()
  }

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('labels')
    setSelectedIds([])
    router.push(`/busqueda_mapa?${params.toString()}`)
    onClose()
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-slate-900 border-r border-stone-200 dark:border-slate-800">

      {/* HEADER */}
      <div className="shrink-0 p-4 pb-3 border-b border-stone-100 dark:border-slate-800">
        <div className="w-full flex items-center justify-center relative mb-1">
          <h3 className="font-bold text-sm text-stone-800 dark:text-slate-100 uppercase tracking-wide text-center">
            Filtrar por Etiquetas
          </h3>
          <button onClick={onClose} className="absolute right-0 p-1 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-stone-500 dark:text-slate-400" />
          </button>
        </div>

        <p className="text-sm text-stone-500 dark:text-slate-400 text-center mb-3">
          Seleccione una o varias etiquetas para refinar la búsqueda
        </p>

        <div className="w-full relative">
          <Search className="w-4 h-4 text-stone-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar etiqueta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            /* Input del buscador con soporte a modo oscuro (bordes y fondo RGB) */
            className="w-full border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none transition-all bg-stone-50 focus:border-[rgb(217,119,6)] focus:ring-1 focus:ring-[rgb(217,119,6)] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:border-[rgb(232,124,30)] dark:focus:ring-[rgb(232,124,30)]"
          />
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-5">

        {/* SELECCIONADAS */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
              Seleccionadas
            </span>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs text-[rgb(217,119,6)] dark:text-[rgb(232,124,30)] font-medium hover:opacity-75 transition-opacity"
              >
                Limpiar
              </button>
            )}
          </div>

          {selectedEtiquetas.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 p-3 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-sm text-stone-400 dark:text-slate-500">No has seleccionado ninguna etiqueta</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedEtiquetas.map(etiqueta => (
                <span
                  key={etiqueta.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm text-sm font-medium text-stone-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: etiqueta.color }} />
                  {etiqueta.nombre}
                  <button
                    onClick={() => toggleSelection(etiqueta.id)}
                    className="w-4 h-4 rounded-full hover:bg-stone-100 dark:hover:bg-slate-700 flex items-center justify-center ml-0.5 transition-colors"
                  >
                    <X size={10} className="text-stone-500 dark:text-slate-400" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* DISPONIBLES */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
              Disponibles
            </span>
            <span className="text-xs text-stone-400">{availableEtiquetas.length} disponibles</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <span className="text-sm text-stone-400">Cargando etiquetas...</span>
            </div>
          ) : availableEtiquetas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 gap-2 text-center">
              <span className="text-lg">🏷️</span>
              <p className="text-sm text-stone-400">
                {searchQuery.trim() ? 'Sin resultados para tu búsqueda' : 'Todas las etiquetas están seleccionadas'}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableEtiquetas.map(etiqueta => (
                <button
                  key={etiqueta.id}
                  onClick={() => toggleSelection(etiqueta.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all border bg-white text-stone-600 border-stone-200 hover:border-[rgb(217,119,6)] hover:text-stone-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-[rgb(232,124,30)] dark:hover:text-slate-100"
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: etiqueta.color }} />
                  <span>{etiqueta.nombre}</span>
                  {typeof etiqueta.cantidad === 'number' && etiqueta.cantidad > 0 && (
                    <span className="text-[10px] px-1.5 rounded-full bg-stone-100">
                      {etiqueta.cantidad}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="shrink-0 px-6 pb-6 pt-4 border-t border-stone-100 bg-white flex flex-col gap-3 dark:border-slate-800 dark:bg-slate-900">
        
        {/* Notificación sutil cuando presiona Aplicar sin selección */}
        {showEmptyWarning && (
          <p className="text-xs text-[rgb(217,119,6)] dark:text-[rgb(232,124,30)] text-center animate-pulse">
            Selecciona al menos una etiqueta para filtrar
          </p>
        )}

        {/* Letras blancas puras y subrayado en modo oscuro */}
        <button
          type="button"
          onClick={handleClear}
          className="text-sm text-stone-400 hover:text-[rgb(217,119,6)] transition-colors underline text-center w-full dark:!text-white dark:hover:!text-[rgb(232,124,30)]"
        >
          Limpiar filtro
        </button>

        {/* Hack RGB y rounded-[12px] para evadir a globals.css */}
        <button
          onClick={handleApply}
          className="w-full !bg-[rgb(217,119,6)] hover:!bg-[rgb(185,94,0)] !text-white rounded-[12px] border-none font-bold py-3 px-4 transition-all active:scale-95 shadow-md dark:!bg-[rgb(232,124,30)] dark:hover:!bg-[rgb(217,119,6)]"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}