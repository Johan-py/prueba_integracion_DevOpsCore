'use client'

import { useState, useEffect, Suspense } from 'react'
import nextDynamic from 'next/dynamic'
import {
  ChevronLeft,
  ChevronRight,
  List as ListIcon,
  LayoutGrid,
  Filter
} from 'lucide-react'

// HOOKS
import { useProperties } from '@/hooks/useProperties'
import { useOrdenamiento } from '@/hooks/useOrdenamiento'

// COMPONENTES
import FilterBar from '@/components/filters/FilterBar'
import PropertyCard from '@/components/layout/PropertyCard'
import PropertyRow from '@/components/galeria/PropertyRow'
import EmptyState from '@/components/galeria/EmptyState'
import { MenuOrdenamiento } from '@/components/busqueda/ordenamiento/MenuOrdenamiento'

// MAPA dinámico
const MapView = nextDynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-stone-100 animate-pulse flex items-center justify-center text-stone-400">
      Cargando mapa de Bolivia...
    </div>
  )
})

function BusquedaMapaContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { properties, isLoading, error } = useProperties()

  const { ordenActual, cambiarOrden } = useOrdenamiento({
    inmuebles: properties
  })

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isHoveringList, setIsHoveringList] = useState(false)

  // Hover con debounce
  useEffect(() => {
    if (!hoveredId) {
      if (!isHoveringList) setSelectedPropertyId(null)
      return
    }

    const timeout = setTimeout(() => {
      if (isHoveringList) setSelectedPropertyId(hoveredId)
    }, 200)

    return () => clearTimeout(timeout)
  }, [hoveredId, isHoveringList])

  // Sync resize mapa
  useEffect(() => {
    const resizeTimeout = setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 300)

    return () => clearTimeout(resizeTimeout)
  }, [isSidebarOpen])

  return (
    <div className="flex flex-col bg-white w-full h-[calc(100dvh-80px)] md:h-[calc(100dvh-99px)] overflow-hidden">
      <FilterBar variant="map" />

      <main className="flex flex-col md:flex-row w-full flex-1 min-h-0 relative overflow-hidden border-b border-stone-200">
        
        {/* SIDEBAR */}
        <aside
          className={`bg-white border-r border-stone-200 flex flex-col z-10 transition-all duration-300 min-h-0 overflow-hidden ${
            isSidebarOpen ? 'w-full md:w-[450px] h-[65dvh] md:h-full' : 'w-0'
          }`}
        >
          {isSidebarOpen && (
            <div className="flex flex-col h-full min-h-0">
              
              {/* HEADER */}
              <div className="p-4 bg-white shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="flex items-center gap-1">
                      <Filter className="w-4 h-4 text-orange-500" />
                      <h1 className="text-base font-semibold uppercase">
                        Filtros
                      </h1>
                    </div>

                    <h2 className="text-sm mt-2">
                      <span className="text-orange-500 font-bold">
                        {properties.length}
                      </span>{' '}
                      resultados
                    </h2>
                  </div>

                  <button onClick={() => setIsSidebarOpen(false)}>
                    <ChevronLeft size={20} />
                  </button>
                </div>

                <MenuOrdenamiento
                  totalResultados={properties.length}
                  ordenActual={ordenActual}
                  onOrdenChange={cambiarOrden}
                />

                {/* Toggle vista */}
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setViewMode('grid')}>
                    <LayoutGrid size={16} />
                  </button>
                  <button onClick={() => setViewMode('list')}>
                    <ListIcon size={16} />
                  </button>
                </div>
              </div>

              {/* LISTA */}
              <div
                className="flex-1 overflow-y-auto p-4 bg-stone-50"
                onMouseEnter={() => setIsHoveringList(true)}
                onMouseLeave={() => {
                  setIsHoveringList(false)
                  setSelectedPropertyId(null)
                  setHoveredId(null)
                }}
              >
                {isLoading ? (
                  <div className="flex justify-center items-center h-full text-stone-400">
                    Cargando...
                  </div>
                ) : properties.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="flex flex-col gap-3">
                    {properties.map((property: any) => (
                      <div
                        key={property.id}
                        onMouseEnter={() => setHoveredId(property.id)}
                        onClick={() => setSelectedPropertyId(property.id)}
                        className={`cursor-pointer ${
                          selectedPropertyId === property.id
                            ? 'ring-2 ring-orange-400'
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
                            size="150m²"
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

        {/* MAPA */}
        <section className="relative bg-stone-200 w-full h-[35dvh] md:flex-1 md:h-auto">
          {!isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(true)}>
              <ChevronRight />
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
    <Suspense fallback={<div>Cargando...</div>}>
      <BusquedaMapaContent />
    </Suspense>
  )
}