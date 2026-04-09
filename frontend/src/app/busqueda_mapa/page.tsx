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
  X
} from 'lucide-react'

import { useProperties } from '@/hooks/useProperties'
import { useOrdenamiento } from '@/hooks/useOrdenamiento'
import FilterBar from '@/components/filters/FilterBar'
import PropertyCard from '@/components/layout/PropertyCard'
import PropertyRow from '@/components/galeria/PropertyRow'
import EmptyState from '@/components/galeria/EmptyState'
import { MenuOrdenamiento } from '@/components/busqueda/ordenamiento/MenuOrdenamiento'

const MapView = nextDynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-stone-100 animate-pulse flex items-center justify-center text-stone-400">
      Cargando mapa de Bolivia...
    </div>
  )
})

function useIsMobile(breakpoint = 768) {
  // Siempre false en el primer render (igual que SSR) para evitar hydration mismatch
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    setIsMobile(mql.matches) // actualiza solo en cliente post-mount
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}

// Detecta landscape en móvil: ancho > alto Y alto < 500px
// (tablets landscape con alto > 500 quedan como desktop)
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

// Alturas en % del contenedor padre (el flex-1 debajo del FilterBar).
// Usar % en vez de dvh evita que el sheet suba por encima del FilterBar.
const SHEET_H = { peek: '50%', full: '100%' } as const
type SheetState = 'hidden' | 'peek' | 'full'

function BusquedaMapaContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sheetState, setSheetState] = useState<SheetState>('peek')
  const [pinnedProperty, setPinnedProperty] = useState<any | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const isMobile = useIsMobile()
  const isLandscape = useIsLandscapeMobile()

  // Evita hydration mismatch: el servidor siempre renderiza desktop.
  // El cliente switcha al layout correcto después del primer mount.
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { properties, isLoading, error } = useProperties()
  const { ordenActual, cambiarOrden } = useOrdenamiento({ inmuebles: properties })

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Touch drag
  const dragStartY = useRef<number | null>(null)
  const dragStartState = useRef<SheetState>('peek')

  useEffect(() => {
    if (!hoveredId) return
    const t = setTimeout(() => setSelectedPropertyId(hoveredId), 200)
    return () => clearTimeout(t)
  }, [hoveredId])

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
      // Arrastró hacia arriba
      setSheetState(dragStartState.current === 'peek' ? 'full' : 'full')
    } else if (dy < -40) {
      // Arrastró hacia abajo
      setSheetState(dragStartState.current === 'full' ? 'peek' : 'hidden')
    }
    dragStartY.current = null
  }

  // ── Shared pieces ──────────────────────────────────────────────────────────
  const PanelHeader = (
    <div className="p-4 bg-white shrink-0">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-slate-900">
          <span className="text-orange-500">{properties.length}</span>
          <span className="ml-2 text-gray-600 font-normal text-base">
            {properties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
          </span>
        </h2>
        {!isMobile && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 hover:bg-stone-100 rounded-full transition-colors text-stone-400"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>
      <div className="border-b border-stone-100 pb-4">
        <MenuOrdenamiento
          totalResultados={properties.length}
          ordenActual={ordenActual}
          onOrdenChange={cambiarOrden}
        />
      </div>
    </div>
  )

  const ViewToggle = (
    <div className="px-4 py-2 border-b border-stone-50 flex justify-end bg-white">
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
  )

  const PropertyList = ({ onClickItem }: { onClickItem?: (p: any) => void }) => (
    <div className="flex-1 overflow-y-auto p-4 bg-stone-50 no-scrollbar">
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-full text-stone-400 text-sm gap-2">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          Actualizando resultados...
        </div>
      ) : properties.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          className={`gap-3 flex flex-col ${viewMode === 'list' ? 'divide-y divide-gray-100 bg-white border border-gray-100 rounded-xl shadow-sm' : ''}`}
        >
          {properties.map((property: any) => (
            <div
              key={property.id}
              onMouseEnter={() => setHoveredId(property.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => {
                setSelectedPropertyId(property.id)
                onClickItem?.(property)
              }}
              className={`cursor-pointer transition-all duration-200 rounded-xl ${selectedPropertyId === property.id ? 'ring-2 ring-orange-400 ring-offset-1' : ''}`}
            >
              {viewMode === 'grid' ? (
                <PropertyCard
                  imagen=""
                  estado={property.type}
                  precio={
                    property.currency === 'USD'
                      ? `$${property.price.toLocaleString('es-BO')} USD`
                      : `Bs ${property.price.toLocaleString('es-BO')}`
                  }
                  descripcion={property.title}
                  camas={3}
                  banos={2}
                  metros={150}
                />
              ) : (
                <PropertyRow
                  title={property.title}
                  price={
                    property.currency === 'USD'
                      ? `$${property.price.toLocaleString('es-BO')} USD`
                      : `Bs ${property.price.toLocaleString('es-BO')}`
                  }
                  size="3 Dorm. • 150 m²"
                  contactType="whatsapp"
                  image=""
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

              {/* Toggle vista grid / lista */}
              <div className="px-4 py-2 border-b border-stone-50 flex justify-end bg-white">
                <div className="flex bg-stone-100 p-1 rounded-md border border-stone-200 shadow-inner scale-90">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1 rounded transition-colors ${viewMode === "grid" ? "bg-white text-[#ea580c] shadow-sm" : "text-stone-400"}`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1 rounded transition-colors ${viewMode === "list" ? "bg-white text-[#ea580c] shadow-sm" : "text-stone-400"}`}
                  >
                    <ListIcon size={16} />
                  </button>
                </div>
              </div>

              {/* Lista de propiedades con hover → fly-to en mapa */}
              <div className="flex-1 overflow-y-auto p-4 bg-stone-50 no-scrollbar">
                {isLoading ? (
                  <div className="flex flex-col justify-center items-center h-full text-stone-400 text-sm gap-2 animate-pulse">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    Actualizando resultados...
                  </div>
                ) : properties.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div
                    className={`gap-4 flex flex-col ${viewMode === "list" ? "divide-y divide-gray-100 bg-white border border-gray-100 rounded-xl shadow-sm" : ""}`}
                  >
                    {properties.map((property: any) => (
                      <div
                        key={property.id}
                        // Hover con debounce: dispara el vuelo del mapa al marcador
                        onMouseEnter={() => setHoveredId(property.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => setSelectedPropertyId(property.id)}
                        className={`cursor-pointer transition-all duration-200 rounded-xl ${
                          selectedPropertyId === property.id
                            ? "ring-2 ring-orange-400 ring-offset-1"
                            : ""
                        }`}
                      >
                        {viewMode === "grid" ? (
                          <PropertyCard
                            imagen=""
                            estado={property.type}
                            precio={
                              property.currency === "USD"
                                ? `$${property.price.toLocaleString("es-BO")} USD`
                                : `Bs ${property.price.toLocaleString("es-BO")}`
                            }
                            descripcion={property.title}
                            camas={3}
                            banos={2}
                            metros={150}
                          />
                        ) : (
                          <PropertyRow
                            title={property.title}
                            price={
                              property.currency === "USD"
                                ? `$${property.price.toLocaleString("es-BO")} USD`
                                : `Bs ${property.price.toLocaleString("es-BO")}`
                            }
                            size="3 Dorm. • 150 m²"
                            contactType="whatsapp"
                            image=""
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Área del mapa */}
        <section className="flex-1 relative bg-stone-200">
          {/* Botón para reabrir el panel cuando está colapsado */}
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
  );
}

export const dynamic = "force-dynamic";

export default function BusquedaMapaPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-white text-gray-500 italic">
          Cargando buscador de PropBol...
        </div>
      }
    >
      <BusquedaMapaContent />
    </Suspense>
  );
}
