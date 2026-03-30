'use client'

import { Search, MapPin, Building, DollarSign, Home, Square } from 'lucide-react'

export default function FilterBar() {
  return (
    <header className="bg-white border-b border-stone-200 shrink-0 z-20 shadow-sm w-full">
      {/* Fila superior: Tipos de contrato */}
      <div className="flex items-center justify-center gap-8 p-3 text-sm border-b border-stone-100">
        <label className="flex items-center gap-2 cursor-pointer text-[#ea580c] font-bold">
          <div className="w-4 h-4 bg-[#ea580c] rounded-sm flex items-center justify-center"></div> 
          Venta
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-stone-500 hover:text-stone-700 transition-colors">
          <div className="w-4 h-4 border border-stone-300 rounded-sm bg-white hover:border-stone-400"></div> 
          Alquiler
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-stone-500 hover:text-stone-700 transition-colors">
          <div className="w-4 h-4 border border-stone-300 rounded-sm bg-white hover:border-stone-400"></div> 
          Anticrético
        </label>
      </div>

      {/* Fila inferior: Buscador y TODOS los Filtros de Mapas */}
      <div className="p-3 flex flex-wrap md:flex-nowrap items-center justify-center gap-3 overflow-x-auto no-scrollbar">
        
        {/* Tipo de Inmueble (Casas) */}
        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-300 rounded-md text-sm text-stone-600 hover:bg-stone-50 transition-colors shrink-0">
          <Building className="w-4 h-4" /> 
          <span className="font-medium">Casas</span>
        </button>

        {/* Buscador */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-md flex-grow min-w-[200px] max-w-md focus-within:ring-1 focus-within:ring-[#ea580c] focus-within:border-[#ea580c] transition-all">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar por zona, ciudad o ID..." 
            className="bg-transparent outline-none text-sm w-full text-stone-700 placeholder-stone-400" 
          />
        </div>

        {/* Zona */}
        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-300 rounded-md text-sm text-stone-600 hover:bg-stone-50 transition-colors shrink-0">
          <MapPin className="w-4 h-4" /> 
          <span className="font-medium">Zona</span>
        </button>

        {/* Precio */}
        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-300 rounded-md text-sm text-stone-600 hover:bg-stone-50 transition-colors shrink-0">
          <DollarSign className="w-4 h-4" /> 
          <span className="font-medium">Precio</span>
        </button>

        {/* Capacidad */}
        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-300 rounded-md text-sm text-stone-600 hover:bg-stone-50 transition-colors shrink-0">
          <Home className="w-4 h-4" /> 
          <span className="font-medium">Capacidad</span>
        </button>

        {/* Metros Cuadrados */}
        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-300 rounded-md text-sm text-stone-600 hover:bg-stone-50 transition-colors shrink-0">
          <Square className="w-4 h-4" /> 
          <span className="font-medium">Metros²</span>
        </button>

        {/* Más Filtros */}
        <button className="px-5 py-1.5 bg-[#ea580c] text-white font-bold text-sm rounded-md shadow-sm hover:bg-[#d44c08] transition-colors shrink-0">
          Más Filtros
        </button>

      </div>
    </header>
  )
}