'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

export default function BusquedaMapaPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-theme(spacing.32))] border rounded-lg overflow-hidden shadow-sm bg-white">
      {/* Barra Superior */}
      <header className="w-full p-4 border-b border-gray-200 bg-gray-50 shrink-0">
        <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          Criterios de Búsqueda (Módulo Externo)
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-10 w-full md:w-1/3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full md:w-1/3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full md:w-1/3 bg-gray-200 rounded animate-pulse"></div>
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
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden text-gray-500 hover:text-gray-800 text-sm font-medium"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-4">
              <div className="h-28 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <div className="h-4 bg-gray-200 w-3/4 mb-3 rounded"></div>
                <div className="h-4 bg-gray-200 w-1/2 mb-3 rounded"></div>
                <div className="h-8 bg-gray-100 w-full rounded mt-auto"></div>
              </div>
            </div>
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
            <MapView selectedId={selectedPropertyId} onSelect={setSelectedPropertyId} />
          </div>
        </section>
      </div>
    </div>
  )
}
