'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ChevronLeft, ChevronRight, List as ListIcon, LayoutGrid } from 'lucide-react'

// === HOOKS (Lógica Backend de tu compañero) ===
import { useProperties } from '@/hooks/useProperties'

// === COMPONENTES (Tu diseño Frontend) ===
import FilterBar from '@/components/FilterBar' 
import PropertyCard from '@/components/layout/PropertyCard'
import PropertyRow from '@/components/galeria/PropertyRow'
import EmptyState from '@/components/galeria/EmptyState'

// Carga dinámica del mapa para evitar errores de SSR en Next.js
const MapView = dynamic(() => import('./MapView'), { ssr: false })

export default function BusquedaMapaPage() {
  // Estados de UI (Frontend)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Estados de Lógica (Backend / Mapas)
  const { properties, isLoading } = useProperties()
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Efecto original del equipo de mapas: Retraso sutil al hacer hover para no saturar el mapa
  useEffect(() => {
    if (!hoveredId) return
    const timeout = setTimeout(() => {
      setSelectedPropertyId(hoveredId)
    }, 200)
    return () => clearTimeout(timeout)
  }, [hoveredId])

  return (
    // Contenedor principal con h-screen y overflow-hidden para evitar scroll global
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      
      {/* 1. BARRA DE FILTROS SUPERIOR (Tu componente limpio) */}
      <FilterBar />

      {/* 2. ÁREA CENTRAL (Lista + Mapa) */}
      <main className="flex flex-1 overflow-hidden relative">
        
        {/* PANEL LATERAL COLAPSABLE */}
        <aside
          className={`bg-white border-r border-stone-200 flex flex-col z-10 transition-all duration-300 ${
            isSidebarOpen ? 'w-full md:w-[450px]' : 'w-0'
          }`}
        >
          {isSidebarOpen && (
            <>
              {/* Botón de ocultar Panel */}
              <div className="p-3 border-b border-stone-200 flex items-center bg-stone-50 shrink-0">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center text-xs font-medium text-stone-500 hover:text-stone-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Ocultar
                </button>
              </div>

              {/* Cabecera de la Lista (Resultados y Toggle de vistas) */}
              <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-slate-900">Lista de Inmuebles</h2>
                  <p className="text-xs text-stone-400 font-medium mt-0.5">
                    {properties.length} encontrado{properties.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Se mantiene este toggle aquí para controlar el state 'viewMode' directamente */}
                <div className="flex bg-stone-100 p-1 rounded-md border border-stone-200 shadow-inner">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-[#ea580c] shadow-sm' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-white text-[#ea580c] shadow-sm' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <ListIcon size={18} />
                  </button>
                </div>
              </div>

              {/* CONTENIDO SCROLLEABLE (Aquí solucionamos el problema de que se iba hasta abajo) */}
              <div className="flex-1 overflow-y-auto p-4 bg-stone-50 no-scrollbar">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full text-stone-500 text-sm font-medium animate-pulse">
                    Cargando propiedades de la base de datos...
                  </div>
                ) : properties.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div
                    className={`gap-4 ${
                      viewMode === 'grid'
                        ? 'flex flex-col'
                        : 'divide-y divide-gray-100 flex flex-col bg-white border border-gray-100 rounded-xl shadow-sm'
                    }`}
                  >
                    {/* Renderizamos las propiedades del BACKEND en tus componentes de FRONTEND */}
                    {properties.map((property) => {
                      const isSelected = selectedPropertyId === property.id

                      return (
                        <div
                          key={property.id}
                          onMouseEnter={() => setHoveredId(property.id)}
                          onClick={() => setSelectedPropertyId(property.id)}
                          // El div reacciona si el pin del mapa está seleccionado
                          className={`cursor-pointer transition-all duration-200 rounded-xl ${
                            viewMode === 'list' ? 'py-1 px-2' : ''
                          } ${
                            isSelected
                              ? 'ring-2 ring-[#ea580c] shadow-md bg-orange-50/50' // Highlight si está seleccionado
                              : 'hover:border-stone-300 hover:shadow-sm'
                          }`}
                        >
                          {viewMode === 'grid' ? (
                            <PropertyCard
                              imagen="" // Mandamos vacío para que active tu COLOR_GRIS_PLACEHOLDER
                              estado={property.type} // casa, terreno, etc.
                              precio={property.currency === 'USD' ? `$${property.price.toLocaleString("es-BO")} USD` : `Bs ${property.price.toLocaleString("es-BO")}`}
                              descripcion={property.title}
                              camas={3} // Mockeado porque PropertyMapPin no trae este dato
                              banos={2} // Mockeado
                              metros={150} // Mockeado
                            />
                          ) : (
                            <PropertyRow
                              title={property.title}
                              price={property.currency === 'USD' ? `$${property.price.toLocaleString("es-BO")} USD` : `Bs ${property.price.toLocaleString("es-BO")}`}
                              size="3 Dorm. • 150 m²"
                              contactType="whatsapp"
                              image=""
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </aside>

        {/* ÁREA DEL MAPA */}
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
            />
          </div>
        </section>
      </main>
    </div>
  )
}
