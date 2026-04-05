'use client'

import { useState, useEffect, Suspense } from 'react'
import nextDynamic from 'next/dynamic'
import { ChevronLeft, ChevronRight, List as ListIcon, LayoutGrid } from 'lucide-react'

<<<<<<< HEAD
const MapView = dynamic(() => import('./MapView'), { ssr: false })
=======
// === HOOKS ===
import { useProperties } from '@/hooks/useProperties'
import { useOrdenamiento } from '@/hooks/useOrdenamiento'
>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5

// === COMPONENTES ===
import FilterBar from '@/components/filters/FilterBar'
import PropertyCard from '@/components/layout/PropertyCard'
import PropertyRow from '@/components/galeria/PropertyRow'
import EmptyState from '@/components/galeria/EmptyState'
import { MenuOrdenamiento } from '@/components/busqueda/ordenamiento/MenuOrdenamiento'
// 🟢 Mantenemos la carga dinámica del mapa
const MapView = nextDynamic(() => import('./MapView'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-stone-100 animate-pulse flex items-center justify-center text-stone-400">
      Cargando mapa de Bolivia...
    </div>
  )
})

// 🟢 Componente con la lógica interna
function BusquedaMapaContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // ⚠️ Estos hooks son los que causan el error si no hay Suspense arriba
  const { properties, isLoading } = useProperties()
  const { ordenActual, cambiarOrden } = useOrdenamiento({ inmuebles: properties })
  
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    if (!hoveredId) return
    const timeout = setTimeout(() => {
      setSelectedPropertyId(hoveredId)
    }, 200)
    return () => clearTimeout(timeout)
  }, [hoveredId])

  return (
<<<<<<< HEAD
    <div className="flex flex-col w-full min-h-[calc(100vh-theme(spacing.32))] border rounded-lg overflow-hidden shadow-sm bg-white">
      {/* Barra Superior */}
      <header className="w-full p-4 border-b border-gray-200 bg-gray-50 shrink-0">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            Criterios de Búsqueda (Módulo Externo)
          </h2>
          {loading && (
            <span className="text-xs text-orange-500 animate-pulse font-medium">
              Actualizando resultados...
            </span>
          )}
        </div>
=======
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <FilterBar 
        variant="map" 
        onSearch={(nuevosFiltros) => {
          console.log('🔍 Buscando con filtros:', nuevosFiltros)
        }} 
      />
      <main className="flex flex-1 overflow-hidden relative">
        <aside
          className={`bg-white border-r border-stone-200 flex flex-col z-10 transition-all duration-300 ${
            isSidebarOpen ? 'w-full md:w-[450px]' : 'w-0'
          }`}
        >
          {isSidebarOpen && (
            <div className="flex flex-col h-full">
              <div className="p-4 bg-white shrink-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-slate-900">
                      <span className="text-orange-500">{properties.length}</span>
                      <span className="ml-2 text-gray-600 font-normal text-lg">
                        {properties.length === 1
                          ? 'propiedad encontrada'
                          : 'propiedades encontradas'}
                      </span>
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 hover:bg-stone-100 rounded-full transition-colors text-stone-400"
                  >
                    <ChevronLeft size={20} />
                  </button>
                </div>
>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5

                <div className="border-b border-stone-100 pb-4">
                   <MenuOrdenamiento 
                     totalResultados={properties.length}
                     ordenActual={ordenActual}
                     onOrdenChange={cambiarOrden} 
                   />
                </div>
              </div>

<<<<<<< HEAD
      {/* Contenedor Principal (Resultados y Mapa) */}
      <div className="flex flex-col md:flex-row flex-grow relative overflow-hidden">
        {/* Panel Lateral Colapsable */}
        <aside
          className={`bg-white transition-all duration-300 z-10 border-gray-200 overflow-hidden ${isSidebarOpen ? 'w-full h-[40vh] md:w-[30%] md:h-auto border-b md:border-b-0 md:border-r opacity-100' : 'w-0 h-0 opacity-0'}`}
        >
          <div className="p-4 h-full overflow-y-auto">
            {/* Map de resultados reales si existen */}
            {data && data.length > 0 ? (
              data.map((prop: any) => (
                <div
                  key={prop.id}
                  className="p-3 border rounded-lg mb-2 hover:border-orange-400 cursor-pointer transition-colors"
                >
                  <p className="font-bold text-sm">{prop.title}</p>
                  <p className="text-xs text-gray-500">
                    {prop.type} en {prop.modoInmueble || 'Venta'}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center mt-10">
                No hay resultados para esta búsqueda.
              </p>
            )}
          </div>
        </aside>

        {/* Área del Mapa */}
        <section className="flex-grow bg-gray-100 relative w-full h-[60vh] md:h-auto transition-all duration-300">
          {/* Botón flotante para expandir/contraer el panel */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute left-0 top-4 z-[1000] bg-white border border-gray-300 shadow-md p-2 rounded-r-md hover:bg-gray-50 flex items-center justify-center transition-colors focus:outline-none hidden md:flex"
            title={isSidebarOpen ? 'Contraer panel' : 'Expandir panel'}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isSidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
              />
            </svg>
          </button>

          <div className="absolute inset-0">
            <MapView
              properties={data || []}
=======
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
                    className={`gap-4 flex flex-col ${viewMode === 'list' ? 'divide-y divide-gray-100 bg-white border border-gray-100 rounded-xl shadow-sm' : ''}`}
                  >
                    {properties.map((property: any) => (
                      <div
                        key={property.id}
                        onMouseEnter={() => setHoveredId(property.id)}
                        onClick={() => setSelectedPropertyId(property.id)}
                        className={`cursor-pointer transition-all duration-200 rounded-xl ${viewMode === 'list' ? 'py-1 px-2' : ''} ${
                          selectedPropertyId === property.id
                            ? 'ring-2 ring-[#ea580c] shadow-md bg-orange-50/50'
                            : 'hover:border-stone-300 hover:shadow-sm'
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
<<<<<<< HEAD
              properties={properties} 
>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5
=======
              properties={properties}
>>>>>>> 453ab1a520127979d6fa94229b1b3a7e940c3a22
              selectedId={selectedPropertyId}
              onSelect={setSelectedPropertyId}
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
