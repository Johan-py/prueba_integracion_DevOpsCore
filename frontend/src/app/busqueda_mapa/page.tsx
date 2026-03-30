'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ChevronLeft } from 'lucide-react'
import FilterBar from '@/components/FilterBar'

import HeaderPanel from '@/components/galeria/HeaderPanel' // lo modificaremos para solo botones
import PropertyRow from '@/components/galeria/PropertyRow'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

export default function BusquedaMapaPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [data, setData] = useState<any[]>([])

  return (
    <div className="flex flex-col h-screen bg-stone-100 overflow-hidden">

      {/* Filtros */}
      <FilterBar />

      <main className="flex flex-1 overflow-hidden relative">

        {/* SIDEBAR */}
        <aside 
          className={`
            bg-white border-r border-stone-200 flex flex-col z-10 transition-all duration-300
            ${isSidebarOpen ? 'w-[450px]' : 'w-0'}
          `}
        >
          <div className={`
            p-4 h-full overflow-y-auto transition-opacity duration-200
            ${isSidebarOpen ? 'opacity-100 delay-100' : 'opacity-0'}
            md:w-[30vw] min-w-[250px]
          `}>
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
            
            <div className="space-y-4">
              {/* 2. Aquí implementamos tus tarjetas dinámicas */}
              <PropertyCard 
                imagen="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=500&q=60"
                estado="EN VENTA"
                precio="$US 180.000"
                descripcion="Casa Obra Gruesa Sobre terreno de 272m2 en Urbanización Bisa"
                camas={4}
                banos={3}
                metros={272}
              />

              <PropertyCard 
                imagen="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=60"
                estado="EN ALQUILER"
                precio="$US 800 / mes"
                descripcion="Hermosa casa minimalista en zona norte con jardín amplio"
                camas={3}
                banos={2}
                metros={150}
              />
            </div>
          </div>
          {isSidebarOpen && (
            <>
              {/* Barra superior solo Ocultar */}
              <div className="p-4 border-b border-stone-200 flex items-center bg-stone-50 shrink-0">
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="flex items-center text-xs text-stone-400 hover:text-stone-600"
                >
                  <ChevronLeft className="w-4 h-4 mr-1"/> Ocultar
                </button>
              </div>

              {/* Título + botones vista + cantidad */}
              <div className="px-4 py-4 border-b border-stone-200 bg-white shrink-0 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Lista de Inmuebles</h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {data.length > 0 ? data.length : 3} encontrado{ (data.length > 0 ? data.length : 3) !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Ahora HeaderPanel solo tiene los botones */}
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
            </>
          )}
        </aside>

        {/* MAPA */}
        <section className="flex-1 relative bg-stone-200">
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="absolute left-0 top-4 z-[1000] bg-white border border-stone-300 p-2 rounded-r-md shadow-md hover:bg-stone-50"
            >
              →
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