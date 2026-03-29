'use client'

import { useState,useEffect} from 'react'
import dynamic from 'next/dynamic'
import { Search, MapPin, DollarSign, Home, Building, Square } from 'lucide-react'
import { useProperties } from '@/hooks/useProperties'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

export default function BusquedaMapaPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const { properties } = useProperties()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
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
            bg-white transition-all duration-300 ease-in-out z-10 border-gray-200 overflow-hidden
            ${
              isSidebarOpen
                ? 'w-full h-[40vh] md:w-[30%] md:h-auto border-b md:border-b-0 md:border-r opacity-100'
                : 'w-0 h-0 md:w-0 md:h-auto opacity-0'
            }
          `}
        >
          <div
            className={`
            p-4 h-full overflow-y-auto transition-opacity duration-200
            ${isSidebarOpen ? 'opacity-100 delay-100' : 'opacity-0'}
            md:w-[30vw] min-w-[250px]
          `}
          >
            {/* Encabezado con el texto y flecha */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium group"
              >
                <span className="text-lg">←</span>
                <span>Lista de inmuebles</span>
              </button>
            </div>
              {/* Esta es una implementación temporal (mock visual) de la lista de inmuebles */}
              <div className="space-y-3">
                {properties.map((property) => (
                 <div
                   key={property.id}
                   onMouseEnter={() => setHoveredId(property.id)}
              
                   onClick={() => setSelectedPropertyId(property.id)}
                   className={`
                    p-3 border rounded-lg cursor-pointer transition-all
                     ${
                      selectedPropertyId === property.id
                       ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-400'
                     }
                   `}
                  >
                   <p className="font-semibold text-sm text-gray-800">
                     {property.title}
                   </p>

                   <p className="text-sm text-gray-600">
                     ${property.price}
                   </p>

                   <p className="text-xs text-gray-400 capitalize">
                     {property.type}
                   </p>
                </div>
              ))}
            </div>
            {/* Fin de codigo temporal  */}
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
              selectedId={selectedPropertyId}
              onSelect={setSelectedPropertyId}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
