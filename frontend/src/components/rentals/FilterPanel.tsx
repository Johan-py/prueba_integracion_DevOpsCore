'use client';

import { ArrowDownUp, Filter } from 'lucide-react';
import { useFilterLogic } from '@/hooks/useFilterLogic'; // Ajusta la ruta según tu carpeta

// Datos de prueba (Simulando lo que vendría del backend de PropBol)
const DUMMY_RENTALS = [
  { name: 'Santa Cruz', count: 5000 },
  { name: 'Cochabamba', count: 2100 },
  { name: 'La Paz', count: 3500 },
  { name: 'Tarija', count: 1200 },
  { name: 'Beni', count: 800 },
  { name: 'Oruro', count: 500 },
];

export default function FilterPanel() {
  // 1. Usamos el Hook pasando los datos iniciales
  const { 
    sortOrder, 
    toggleSort, 
    handleSeeMore, 
    getVisibleData,
    viewLevel 
  } = useFilterLogic(DUMMY_RENTALS);

  // 2. Obtenemos solo los datos que deben ser visibles
  const visibleRentals = getVisibleData(DUMMY_RENTALS);

  return (
    <aside className="w-full md:w-80 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">

      {/* CABECERA */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2 text-gray-900">
          <Filter size={20} className="text-orange-500" /> 
          <h2 className="text-lg font-bold">Filtros</h2>
        </div>

        {/* BOTÓN ORDENAR (Conectado a toggleSort) */}
        <button 
          onClick={toggleSort}
          className="flex items-center gap-1 cursor-pointer group outline-none"
        >
          <span className="text-sm font-medium text-orange-400 group-hover:text-orange-600">
            {sortOrder === 'none' ? 'Ordenar' : sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </span>
          <ArrowDownUp size={16} className={`transition-colors ${sortOrder !== 'none' ? 'text-orange-600' : 'text-orange-400 group-hover:text-orange-600'}`} />
        </button>
      </div>

      {/* SECCIÓN: Alquileres */}
      <section className="mt-4">
        <h3 className="text-xl font-bold text-black mb-3 inline-block border-b-2 border-black pb-0.5">
          Alquileres
        </h3>
        
        <div className="flex flex-col gap-2 mt-2">
          {/* 3. Renderizado Dinámico con .map() */}
          {visibleRentals.map((city, index) => (
            <div key={index} className="flex justify-between items-center text-lg">
              <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
                {city.name}
              </span>
              <span className="text-gray-400">{city.count} casas</span>
            </div>
          ))}

          {/* 4. BOTÓN VER MÁS (Conectado a handleSeeMore) */}
          {/* Solo se muestra si no estamos en el nivel máximo de visualización */}
          {viewLevel < 3 && (
            <button 
              onClick={handleSeeMore}
              className="text-sm text-orange-400 hover:text-orange-600 font-medium mt-1 w-fit transition-colors underline"
            >
              Ver más {'>'}
            </button>
          )}
        </div>
      </section>
    </aside>
  );
}