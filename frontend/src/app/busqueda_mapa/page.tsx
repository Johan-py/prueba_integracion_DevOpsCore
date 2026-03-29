'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Search, MapPin, DollarSign, Home, Building, Square, ChevronRight, List, ChevronLeft } from 'lucide-react'
import { useProperties } from '@/hooks/useProperties'
import FilterBar from '@/components/FilterBar'

import HeaderPanel from '@/components/galeria/HeaderPanel' // lo modificaremos para solo botones
import PropertyRow from '@/components/galeria/PropertyRow'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

export default function BusquedaMapaPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const { properties } = useProperties()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [data, setData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

   useEffect(() => {
  if (!hoveredId) return

  const timeout = setTimeout(() => {
    setSelectedPropertyId(hoveredId)
  }, 200)
  return () => clearTimeout(timeout)
}, [hoveredId])

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-theme(spacing.32))] border rounded-lg overflow-hidden shadow-sm bg-white">
      {/* Barra Superior */}
      <header className="w-full p-4 border-b border-gray-200 bg-white shrink-0 z-10 shadow-sm">
        {/* Fila superior: Tipos de contrato */}
        <div className="flex items-center justify-center gap-8 mb-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-5 h-5 bg-[#ea580c] rounded-sm flex items-center justify-center"></div>
            <span className="text-[#ea580c] font-medium">Venta</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-5 h-5 border-2 border-gray-300 rounded-sm hover:border-gray-400 transition-colors"></div>
            <span className="text-gray-600">Alquiler</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-5 h-5 border-2 border-gray-300 rounded-sm hover:border-gray-400 transition-colors"></div>
            <span className="text-gray-600">Anticrético</span>
          </label>
        </div>

        {/* Fila inferior: Filtros principales */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
            <Building className="w-4 h-4" />
            <span className="font-medium text-sm">Casas</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md flex-grow min-w-[200px] max-w-md focus-within:border-[#ea580c] focus-within:ring-1 focus-within:ring-[#ea580c] transition-all">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar"
              value={searchTerm}  //conecta el input 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outline-none w-full text-gray-700 placeholder-gray-400 text-sm bg-transparent"
            />
          </div>

          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
            <MapPin className="w-4 h-4" />
            <span className="font-medium text-sm">Zona</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
            <DollarSign className="w-4 h-4" />
            <span className="font-medium text-sm">Precio</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
            <Home className="w-4 h-4" />
            <span className="font-medium text-sm">Capacidad</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
            <Square className="w-4 h-4" />
            <span className="font-medium text-sm">Metros²</span>
          </button>

          <button className="px-5 py-2 bg-[#ea580c] text-white font-medium text-sm rounded-md hover:bg-[#c2410c] transition-colors whitespace-nowrap">
            Más Filtros
          </button>
        </div>
      </header>

            {/* Contenedor Principal (Resultados y Mapa) */}
      <div className="flex flex-col md:flex-row flex-grow relative overflow-hidden">
        {/* Panel Lateral Colapsable */}
        <aside
          className={`
            bg-white transition-all duration-300 ease-in-out z-10 flex flex-col border-gray-200 overflow-hidden
            ${
              isSidebarOpen
                ? 'w-full h-[40vh] md:w-[450px] md:min-w-[450px] md:h-auto border-b md:border-b-0 md:border-r opacity-100'
                : 'w-0 h-0 md:w-0 md:h-auto opacity-0'
            }
          `}
        >
          {/* Contenedor interno para animar opacidad sin romper Flexbox */}
          <div
            className={`
            flex flex-col h-full w-full transition-opacity duration-200
            ${isSidebarOpen ? 'opacity-100 delay-100' : 'opacity-0'}
          `}
          >
            {/* AQUÍ ESTÁ: Barra superior con botón Ocultar */}
            <div className="p-4 border-b border-stone-200 flex items-center bg-stone-50 shrink-0">
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="flex items-center text-xs text-stone-400 hover:text-stone-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1"/> Ocultar
              </button>
            </div>

            {/* Título + botones vista + cantidad */}
            <div className="px-4 py-4 border-b border-stone-200 bg-white shrink-0 flex items-center justify-between">
              <div>
                {/* Título Dinámico */}
                <h1 className="text-xl font-bold text-gray-900 line-clamp-1">
                  {searchTerm ? `Resultados: ${searchTerm}` : 'Lista de Inmuebles'}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {data.length > 0 ? data.length : 3} encontrado{ (data.length > 0 ? data.length : 3) !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Botones de HeaderPanel */}
              <HeaderPanel />
            </div>

            {/* Contenido scroll */}
            <div className="flex-1 overflow-y-auto p-4 bg-white no-scrollbar">
              <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">

                {/* Header tabla */}
                <div className="grid grid-cols-[40px_70px_minmax(0,1fr)_50px] gap-2 bg-gray-50/70 px-3 py-2 border-b items-center">
                  <span className="text-[9px] font-bold text-gray-500">Foto</span>
                  <span className="text-[9px] font-bold text-gray-500">Precio</span>
                  <span className="text-[9px] font-bold text-gray-500">Detalle / m²</span>
                  <span className="text-[9px] font-bold text-gray-500 text-center">Contacto</span>
                </div>

                {/* Filas */}
                <div className="divide-y divide-gray-50">
                  {data.length > 0 ? (
                    data.map((item, index) => (
                      <PropertyRow
                        key={index}
                        title={item.title}
                        price={item.price}
                        size={item.size}
                        contactType={item.contactType}
                        image={item.image}
                      />
                    ))
                  ) : (
                    <>
                      <PropertyRow 
                        title="Casa Obra Gruesa..." 
                        price="$us 189K" 
                        size="272 m²" 
                        contactType="whatsapp"
                        image="https://images.unsplash.com/photo-1568605114967-8130f3a36994"
                      />
                      <PropertyRow 
                        title="Depto Minimalista..." 
                        price="Bs 950K" 
                        size="110 m²" 
                        contactType="messenger"
                        image="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"
                      />
                      <PropertyRow 
                        title="Terreno Comercial" 
                        price="$us 85K" 
                        size="500 m²" 
                        contactType="whatsapp"
                        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>  
        </aside>

        {/* Área del Mapa */}
        <section className="flex-grow bg-gray-100 relative w-full h-[60vh] md:h-auto transition-all duration-300">
          {/* Botón flotante para expandir/contraer el panel */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute left-0 top-4 z-[1000] bg-white text-black shadow-md rounded-r-md hover:bg-gray-100 transition-colors focus:outline-none flex flex-col items-center pt-3 pb-5 px-1.5 gap-4 border-l-0"
              title="Mostrar Lista de Inmuebles"
            >
              <ChevronRight className="w-4 h-4" />
              <span 
                className="[writing-mode:vertical-lr] rotate-180 text-xs font-bold tracking-widest whitespace-nowrap"
              >
                Inmuebles
              </span>
              <List className="w-4 h-4 text-black mt-1" />
            </button>
          )}

          <div className="absolute inset-0">
            <MapView />
          </div>
        </section>
      </div>  
    </div>
  )
}

