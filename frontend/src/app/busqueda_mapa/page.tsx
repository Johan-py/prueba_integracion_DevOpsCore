'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import nextDynamic from 'next/dynamic'
import {
  ChevronLeft,
  ChevronRight,
  List as ListIcon,
  LayoutGrid,
  ChevronUp,
  ChevronDown,
  X,
  Filter
} from 'lucide-react'

// === HOOKS ===
import { useProperties } from '@/hooks/useProperties'
import { useOrdenamiento } from '@/hooks/useOrdenamiento'

// === COMPONENTES ===
import FilterBar from '@/components/filters/FilterBar'
import PropertyCard from '@/components/layout/PropertyCard'
import PropertyRow from '@/components/galeria/PropertyRow'
import EmptyState from '@/components/galeria/EmptyState'
import { MenuOrdenamiento } from '@/components/busqueda/ordenamiento/MenuOrdenamiento'

// Carga dinámica del mapa (sin SSR)
const MapView = nextDynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-stone-100 animate-pulse flex items-center justify-center text-stone-400">
      Cargando mapa de Bolivia...
    </div>
  )
})

// === HOOKS DE DETECCIÓN MÓVIL (De Develop) ===
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    setIsMobile(mql.matches)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}

function useIsLandscapeMobile() {
  const [isLandscape, setIsLandscape] = useState(false)
  useEffect(() => {
    const handler = () => {
      setIsLandscape(window.innerWidth > window.innerHeight && window.innerHeight < 500)
    }
    window.addEventListener('resize', handler)
    window.addEventListener('orientationchange', handler)
    handler()
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('orientationchange', handler)
    }
  }, [])
  return isLandscape
}

const SHEET_H = { peek: '50%', full: '100%' } as const
type SheetState = 'hidden' | 'peek' | 'full'

function BusquedaMapaContent() {
  // === ESTADOS COMPARTIDOS ===
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sheetState, setSheetState] = useState<SheetState>('peek')
  const [pinnedProperty, setPinnedProperty] = useState<any | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const isMobile = useIsMobile()
  const isLandscape = useIsLandscapeMobile()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { properties, isLoading, error } = useProperties()
  const { ordenActual, cambiarOrden } = useOrdenamiento({ inmuebles: properties })

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  
  // === ESTADO ORIGINAL PARA DESKTOP (Su lógica de hover) ===
  const [isHoveringList, setIsHoveringList] = useState(false) 

  const dragStartY = useRef<number | null>(null)
  const dragStartState = useRef<SheetState>('peek')

  // Hover con debounce de 200 ms → vuela el mapa al marcador (Su lógica intacta)
  useEffect(() => {
    if (!hoveredId) {
      if (!isHoveringList) {
        setSelectedPropertyId(null)
      }
      return
    }
    const timeout = setTimeout(() => {
      if (isHoveringList) {
        setSelectedPropertyId(hoveredId)
      }
    }, 200)
    return () => clearTimeout(timeout)
  }, [hoveredId, isHoveringList])

  // Sincronización del mapa con el colapso del panel lateral
  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 310)
    return () => clearTimeout(t)
  }, [isSidebarOpen, sheetState])

  function handleMapSelect(id: string) {
    setSelectedPropertyId(id)
    const prop = properties.find((p: any) => p.id === id)
    if (prop) {
      setPinnedProperty(prop)
      setSheetState('peek')
    }
  }

  // Eventos táctiles para el Bottom Sheet (Develop)
  function onTouchStart(e: React.TouchEvent) {
    dragStartY.current = e.touches[0].clientY
    dragStartState.current = sheetState === 'hidden' ? 'peek' : sheetState
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (dragStartY.current === null) return
    const dy = dragStartY.current - e.changedTouches[0].clientY
    if (Math.abs(dy) < 20) {
      dragStartY.current = null
      return
    }
    if (dy > 40) {
      setSheetState(dragStartState.current === 'peek' ? 'full' : 'full')
    } else if (dy < -40) {
      setSheetState(dragStartState.current === 'full' ? 'peek' : 'hidden')
    }
    dragStartY.current = null
  }

  // ── PIEZAS COMPARTIDAS SOLO PARA MÓVIL (De Develop) ───────────────────────
  const MenuToggleComponent = (
    <div className="flex bg-stone-100 p-1 rounded-md border border-stone-200 shadow-inner scale-90">
      <button onClick={() => setViewMode('grid')} className={`p-1 rounded transition-colors ${viewMode === 'grid' ? 'bg-white text-[#ea580c] shadow-sm' : 'text-stone-400'}`}>
        <LayoutGrid size={16} />
      </button>
      <button onClick={() => setViewMode('list')} className={`p-1 rounded transition-colors ${viewMode === 'list' ? 'bg-white text-[#ea580c] shadow-sm' : 'text-stone-400'}`}>
        <ListIcon size={16} />
      </button>
    </div>
  )

  const PropertyListMobile = ({ onClickItem }: { onClickItem?: (p: any) => void }) => (
    <div className="flex-1 overflow-y-auto p-4 bg-stone-50 no-scrollbar">
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-full text-stone-400 text-sm gap-2">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> Actualizando...
        </div>
      ) : properties.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={`gap-3 flex flex-col ${viewMode === 'list' ? 'divide-y divide-gray-100 bg-white border border-gray-100 rounded-xl shadow-sm' : ''}`}>
          {properties.map((property: any) => (
            <div
              key={property.id}
              onClick={() => { setSelectedPropertyId(property.id); onClickItem?.(property) }}
              className={`cursor-pointer transition-all duration-200 rounded-xl ${selectedPropertyId === property.id ? 'ring-2 ring-orange-400 ring-offset-1' : ''}`}
            >
              {viewMode === 'grid' ? (
                <PropertyCard imagen="" estado={property.type} precio={property.currency === 'USD' ? `$${property.price.toLocaleString('es-BO')} USD` : `Bs ${property.price.toLocaleString('es-BO')}`} descripcion={property.title} camas={3} banos={2} metros={150} />
              ) : (
                <PropertyRow title={property.title} price={property.currency === 'USD' ? `$${property.price.toLocaleString('es-BO')} USD` : `Bs ${property.price.toLocaleString('es-BO')}`} size="3 Dorm. • 150 m²" contactType="whatsapp" image="" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER LANDSCAPE MÓVIL (Develop)
  // ────────────────────────────────────────────────────────────────────────────
  if (isMounted && (isMobile || isLandscape)) {
    if (isLandscape) {
      return (
        <div className="flex flex-col bg-white overflow-hidden" style={{ height: '100dvh' }}>
          <div className="shrink-0" style={{ zIndex: 1002, position: 'relative' }}>
            <FilterBar variant="map" onSearch={(f) => console.log('🔍 Filtros:', f)} />
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 relative">
              <div className="absolute inset-0">
                <MapView properties={properties} selectedId={selectedPropertyId} onSelect={(id) => { setSelectedPropertyId(id); setPinnedProperty(properties.find((p: any) => p.id === id) ?? null) }} isLoading={isLoading} error={error} />
              </div>
            </div>
            <div className="w-[280px] flex flex-col bg-white border-l border-stone-200 overflow-hidden shrink-0">
              <div className="px-3 py-2 border-b border-stone-100 flex items-center justify-between shrink-0">
                <span className="text-sm font-semibold text-slate-700">
                  <span className="text-orange-500">{properties.length}</span><span className="ml-1 text-gray-500 font-normal text-xs">props.</span>
                </span>
                {MenuToggleComponent}
              </div>
              <PropertyListMobile onClickItem={(p) => setPinnedProperty(p)} />
            </div>
          </div>
        </div>
      )
    }

    // ────────────────────────────────────────────────────────────────────────────
    // RENDER PORTRAIT MÓVIL — Bottom Sheet (Develop)
    // ────────────────────────────────────────────────────────────────────────────
    return (
      <div className="flex flex-col overflow-hidden bg-white" style={{ height: '100dvh' }}>
        <div className="shrink-0 overflow-x-auto" style={{ zIndex: 1002, position: 'relative' }}>
          <div className="min-w-max">
            <FilterBar variant="map" onSearch={(f) => console.log('🔍 Filtros:', f)} />
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0">
            <MapView properties={properties} selectedId={selectedPropertyId} onSelect={handleMapSelect} isLoading={isLoading} error={error} />
          </div>
          {sheetState === 'hidden' && (
            <button onClick={() => setSheetState('peek')} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1001] bg-white rounded-full px-5 py-3 shadow-xl border border-stone-200 flex items-center gap-2 text-sm font-semibold text-slate-700 active:scale-95 transition-transform" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
              <ListIcon size={16} className="text-orange-500" /> Ver lista
              {properties.length > 0 && <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">{properties.length}</span>}
              <ChevronUp size={16} className="text-stone-400" />
            </button>
          )}
          {sheetState !== 'hidden' && (
            <div className="absolute left-0 right-0 bottom-0 z-[400] bg-white rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)] flex flex-col" style={{ height: SHEET_H[sheetState], transition: 'height 0.3s cubic-bezier(0.32,0.72,0,1)' }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <div className="shrink-0 flex flex-col items-center pt-3 pb-1 cursor-grab active:cursor-grabbing select-none">
                <div className="w-10 h-1.5 bg-stone-300 hover:bg-orange-400 rounded-full mb-3 transition-colors" onClick={() => setSheetState((s) => (s === 'full' ? 'peek' : 'full'))} />
                <div className="flex items-center justify-between w-full px-4 pb-2">
                  <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="text-orange-500">{properties.length}</span><span className="text-gray-500 font-normal">propiedades</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Botón cerrar sheet → vuelve a hidden (mapa limpio) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSheetState('hidden')
                      }}
                      className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 bg-stone-100 rounded-full px-2 py-1"
                    >
                      <X size={12} />
                      <span>Ocultar</span>
                    </button>

                    {/* Toggle peek ↔ full */}
                    {sheetState === 'peek' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSheetState('full')
                        }}
                        className="text-stone-400 hover:text-stone-600 p-1"
                      >
                        <ChevronUp size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSheetState('peek')
                        }}
                        className="text-stone-400 hover:text-stone-600 p-1"
                      >
                        <ChevronDown size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Contenido scrolleable */}
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Card de propiedad seleccionada desde el mapa */}
                {pinnedProperty && (
                  <div className="mx-4 mb-3 relative shrink-0">
                    <button
                      onClick={() => {
                        setPinnedProperty(null)
                        setSelectedPropertyId(null)
                      }}
                      className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow text-stone-400 hover:text-stone-600"
                    >
                      <X size={14} />
                    </button>
                    <div className="ring-2 ring-orange-400 rounded-xl overflow-hidden">
                      <PropertyCard
                        imagen=""
                        estado={pinnedProperty.type}
                        precio={
                          pinnedProperty.currency === 'USD'
                            ? `$${pinnedProperty.price.toLocaleString('es-BO')} USD`
                            : `Bs ${pinnedProperty.price.toLocaleString('es-BO')}`
                        }
                        descripcion={pinnedProperty.title}
                        camas={3}
                        banos={2}
                        metros={150}
                      />
                    </div>
                  </div>
                )}

                {/* Ordenamiento */}
                <div className="px-4 shrink-0 border-b border-stone-100 pb-2">
                  <MenuOrdenamiento
                    totalResultados={properties.length}
                    ordenActual={ordenActual}
                    onOrdenChange={cambiarOrden}
                  />
                </div>

                {/* Toggle grid/lista */}
                <div className="px-4 py-2 flex justify-end shrink-0">
                  <div className="flex bg-stone-100 p-1 rounded-md border border-stone-200 shadow-inner scale-90">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1 rounded transition-colors ${viewMode === 'grid' ? 'bg-white text-[#ea580c] shadow-sm' : 'text-stone-400'}`}
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1 rounded transition-colors ${viewMode === 'list' ? 'bg-white text-[#ea580c] shadow-sm' : 'text-stone-400'}`}
                    >
                      <ListIcon size={16} />
                    </button>
                  </div>
                </div>

                <PropertyList
                  onClickItem={(p) => {
                    setPinnedProperty(p)
                    setSheetState('peek')
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    ) // end portrait
  } // end if(isMobile || isLandscape)

  // ────────────────────────────────────────────────────────────────────────────
  // DESKTOP / TABLET
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col bg-white overflow-hidden"
      style={{ height: 'calc(100dvh - 180px)' }}
    >
      <FilterBar variant="map" onSearch={(f) => console.log('🔍 Filtros:', f)} />
      <main className="flex flex-1 overflow-hidden relative border-b border-stone-200">
        <aside
          className={`bg-white border-r border-stone-200 flex flex-col z-10 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'w-[450px]' : 'w-0'}`}
        >
          {isSidebarOpen && (
            <div className="flex flex-col h-full w-[450px]">
              {PanelHeader}
              {ViewToggle}
              <PropertyList />
            </div>
          )}
        </aside>
        <section className="flex-1 relative bg-stone-200">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute left-0 top-4 z-[1000] bg-white text-black shadow-md rounded-r-md flex flex-col items-center py-4 px-2 gap-4 hover:bg-stone-50 transition-colors"
            >
              <ChevronRight size={16} />
              <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-bold tracking-widest uppercase text-stone-600">
                Inmuebles
              </span>
              <ListIcon size={16} className="text-stone-500" />
            </button>
          )}
          <div className="absolute inset-0">
            <MapView
              properties={properties}
              selectedId={selectedPropertyId}
              onSelect={setSelectedPropertyId}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </section>
      </main>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default function BusquedaMapaPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center bg-white text-gray-500 italic"
          style={{ height: '100dvh' }}
        >
          Cargando buscador de PropBol...
        </div>
      }
    >
      <BusquedaMapaContent />
    </Suspense>
  )
}
