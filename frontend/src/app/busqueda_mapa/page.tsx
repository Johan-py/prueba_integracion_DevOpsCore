'use client'

import { useState, useEffect, Suspense } from 'react'
import nextDynamic from 'next/dynamic'
import { ChevronLeft, ChevronRight, List as ListIcon, LayoutGrid, Filter } from 'lucide-react'

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

// Componente con la lógica interna (necesita Suspense por useSearchParams en useProperties)
function BusquedaMapaContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { properties, isLoading, error } = useProperties()
  const { ordenActual, cambiarOrden } = useOrdenamiento({
    inmuebles: properties
  })

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isHoveringList, setIsHoveringList] = useState(false) // Controlar hover en tarjeta inmueble

  // Hover con debounce de 200 ms → vuela el mapa al marcador
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

  //Sincronización del mapa con el colapso del panel lateral
  useEffect(() => {
    // 300ms es exactamente el tiempo que dura su clase 'duration-300'
    const resizeTimeout = setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 300)

    return () => clearTimeout(resizeTimeout)
  }, [isSidebarOpen])

  return (
    <div className="flex flex-col bg-white w-full h-[calc(100dvh-80px)] md:h-[calc(100dvh-99px)] overflow-hidden">
      <FilterBar
        variant="map"
        onSearch={(nuevosFiltros) => {
          console.log('🔍 Buscando con filtros:', nuevosFiltros)
        }}
      />

      <main className="flex flex-col md:flex-row w-full flex-1 min-h-0 relative overflow-hidden border-b border-stone-200">
        {/* Panel lateral colapsable */}
        <aside
          className={`bg-white border-r border-stone-200 flex flex-col z-10 transition-all duration-300 min-h-0 overflow-hidden ${
        isSidebarOpen 
              ? "w-full md:w-[450px] h-[65dvh] md:h-full" 
              : "w-0"
          }`}
        >
          {isSidebarOpen && (
            <div className="flex flex-col h-full min-h-0">
              {/* Cabecera del panel (FUSIONADA) */}
              <div className="p-4 bg-white shrink-0">
                <div className="flex justify-between items-center mb-4">
                  {/* Lado Izquierdo: Título y cantidad */}
                  <div className="flex flex-col">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Filter className="w-4 h-4 text-orange-500" />
                        <h1 className="text-base font-semibold text-stone-900 uppercase tracking-wide">
                          Filtros{' '}
                        </h1>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-xl font-semibold text-slate-800">
                          Resultados de búsqueda
                        </h1>
                      </div>
                      <h2 className="text-sm font-bold text-slate-900">
                        <span className="text-orange-500">{properties.length}</span>
                        <span className="ml-2 text-gray-600 font-normal text-sm">
                          {properties.length === 1
                            ? 'propiedad encontrada'
                            : 'propiedades encontradas'}
                        </span>
                      </h2>
                    </div>
                  </div>

                  {/* Lado Derecho: SOLO Botón cerrar */}
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 hover:bg-stone-100 rounded-full transition-colors text-stone-400"
                  >
                    <ChevronLeft size={20} />
                  </button>
                </div>

                {/* Contenedor relativo para el Menú y el Switch flotante */}
                {/* Aumentamos pb-4 para darle espacio al posicionamiento absoluto */}
                <div className="relative border-b border-stone-100 pb-4 [&>div]:mb-0">
                  <MenuOrdenamiento
                    totalResultados={properties.length}
                    ordenActual={ordenActual}
                    onOrdenChange={cambiarOrden}
                  />

                  {/* NUEVO: Switch flotante alineado a la derecha de los filtros */}
                  <div className="absolute right-0 bottom-4 flex bg-stone-100 p-1 rounded-md border border-stone-200 shadow-inner scale-90 origin-bottom-right">
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
              </div>

              {/* Lista de propiedades con hover → fly-to en mapa */}
              <div
                className="flex-1 min-h-0 overflow-y-auto p-4 bg-stone-50 no-scrollbar"
                onMouseEnter={() => setIsHoveringList(true)}
                onMouseLeave={() => {
                  setIsHoveringList(false)
                  setSelectedPropertyId(null)
                  setHoveredId(null)
                }}
              >
                {isLoading ? (
                  <div className="flex flex-col justify-center items-center h-full text-stone-400 text-sm gap-2 animate-pulse">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    Actualizando resultados...
                  </div>
                ) : properties.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div
                    className={`gap-4 flex flex-col ${viewMode === 'list' ? 'divide-y divide-gray-100 bg-white border border-gray-100 rounded-xl shadow-sm' : ''}`}
                  >
                    {properties.map((property: any) => (
                      <div
                        key={property.id}
                        onMouseEnter={() => setHoveredId(property.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => setSelectedPropertyId(property.id)}
                        // 1. SOLO clases base aquí (cursor, transición, bordes)
                        className={`cursor-pointer transition-all duration-200 rounded-xl relative ${
                          // 2. SOLO aquí va la reducción (porque solo afecta al Grid)
                          viewMode === 'grid'
                            ? 'transform scale-95 origin-top mx-auto mb-[-4%]'
                            : // 3. Vista de lista limpia
                              'w-full py-1 hover:bg-stone-100'
                        } ${
                          selectedPropertyId === property.id
                            ? 'ring-2 ring-orange-400 ring-offset-1 z-10'
                            : ''
                        }`}
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
            </div>
          )}
        </aside>

        {/* Área del mapa */}
<section className="relative bg-stone-200 w-full h-[35dvh] md:flex-1 md:h-auto min-w-0">
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
  )
}

export const dynamic = 'force-dynamic'

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
  )
}
