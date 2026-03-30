'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { 
  ChevronLeft, LayoutGrid, List, Search, MapPin, 
  DollarSign, Home, Building, Square, ChevronRight
} from 'lucide-react'

// Datos Mockeados
import { mockCasas } from '@/data/mockCasas'

// Componentes
import PropertyCard from '@/components/layout/PropertyCard'
import PropertyRow from '@/components/galeria/PropertyRow'
import EmptyState from '@/components/galeria/EmptyState'

// Carga dinámica del mapa para evitar errores de SSR en Next.js
const MapView = dynamic(() => import('./MapView'), { ssr: false })

export default function BusquedaMapaPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [data] = useState(mockCasas) 

  // Lógica de Dev 3: Filtrar datos según la búsqueda
  const filteredData = data.filter(casa => 
    casa.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      
      {/* HEADER PRINCIPAL */}
      <header className="w-full p-4 border-b border-gray-200 bg-white shrink-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          
          {/* Fila 1: Botoncitos de tipo de contrato */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 accent-orange-600 rounded border-gray-300" defaultChecked />
              <span className="text-orange-600 font-bold">Venta</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 accent-gray-400 rounded border-gray-300" />
              <span className="text-gray-500 group-hover:text-gray-700">Alquiler</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 accent-gray-400 rounded border-gray-300" />
              <span className="text-gray-500 group-hover:text-gray-700">Anticrético</span>
            </label>
          </div>

          {/* Fila 2: Buscador y Filtros Rápidos */}
          <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-white">
              <Building size={16} /> Casas
            </button>
            
            <div className="flex-grow flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md max-w-md focus-within:border-orange-500 transition-all">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por zona, ciudad o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="outline-none w-full text-sm bg-transparent"
              />
            </div>

            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600"><MapPin size={16}/> Zona</button>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600"><DollarSign size={16}/> Precio</button>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600"><Home size={16}/> Capacidad</button>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600"><Square size={16}/> Metros²</button>
            
            <button className="bg-[#ea580c] text-white px-5 py-2 rounded-md font-bold text-sm hover:bg-orange-700 transition-colors">
              Más Filtros
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        <aside className={`bg-white border-r border-stone-200 flex flex-col z-10 transition-all duration-300 ${isSidebarOpen ? 'w-full md:w-[450px]' : 'w-0'}`}>
          {isSidebarOpen && (
            <>
              {/* Botón de ocultar Panel */}
              <div className="p-3 border-b border-stone-200 flex items-center bg-stone-50 shrink-0">
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="flex items-center text-xs font-medium text-stone-500 hover:text-stone-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1"/> Ocultar
                </button>
              </div>

              {/* CABECERA DE LA LISTA */}
              <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-slate-900">
                    {searchTerm ? `Resultados: ${searchTerm}` : 'Lista de Inmuebles'}
                  </h2>
                  <p className="text-xs text-stone-400 font-medium mt-0.5">
                    {filteredData.length} encontrado{filteredData.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                {/* Botones Toggle Grid/List */}
                <div className="flex bg-stone-100 p-1 rounded-md border border-stone-200 shadow-inner">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white text-[#ea580c] shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white text-[#ea580c] shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>

              {/* CONTENIDO (AQUÍ USAMOS TUS COMPONENTES) */}
              <div className="flex-1 overflow-y-auto p-4 bg-stone-50 no-scrollbar">
                {filteredData.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className={`gap-4 ${viewMode === 'grid' ? 'flex flex-col' : 'divide-y divide-gray-100 flex flex-col bg-white border border-gray-100 rounded-xl shadow-sm'}`}>
                    {filteredData.map((inmueble) => (
                      <div key={inmueble.id} className={viewMode === 'list' ? 'py-1' : ''}>
                        {viewMode === 'grid' ? (
                          <PropertyCard {...inmueble} />
                        ) : (
                          <PropertyRow
                            title={inmueble.descripcion}
                            price={inmueble.precio}
                            size={`${inmueble.camas} Dorm. • ${inmueble.metros} m²`}
                            contactType="whatsapp" 
                            image={inmueble.imagen || ''}
                          />
                        )}
                      </div>
                    ))}
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
              <List size={16} className="text-stone-500" />
            </button>
          )}
          <div className="absolute inset-0">
            <MapView />
          </div>
        </section>
      </main>
    </div>
  )
}