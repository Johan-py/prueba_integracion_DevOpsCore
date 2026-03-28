'use client';

import { useState } from 'react'; // Este es el "nosequé" que faltaba importar
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

const DUMMY_SALES = [
  { name: 'Santa Cruz', count: 8000 },
  { name: 'Cochabamba', count: 4200 },
  { name: 'La Paz', count: 1500 },
  { name: 'Tarija', count: 900 },
];

const DUMMY_TYPES = [
  { name: 'Casas', count: 12000 },
  { name: 'Departamentos', count: 8500 },
  { name: 'Terrenos', count: 3000 },
  { name: 'Oficinas', count: 1200 },
];

export default function FilterPanel() {
  // 1. Usamos el Hook pasando los datos iniciales
const [limitRentals, setLimitRentals] = useState(3);
const [limitSales, setLimitSales] = useState(3);
const [limitTypes, setLimitTypes] = useState(3);
const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

const toggleSort = () => setSortOrder(prev => prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none');

// Función auxiliar de ordenamiento (Estándar: 1 responsabilidad [cite: 74])
const sortData = (data: { name: string, count: number }[]) => {
  if (sortOrder === 'none') return data;
  return [...data].sort((a, b) => 
    sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  );
};
  // 2. Obtenemos solo los datos que deben ser visibles para cada sección
const visibleRentals = sortData(DUMMY_RENTALS).slice(0, limitRentals);
const visibleSales = sortData(DUMMY_SALES).slice(0, limitSales);
const visibleTypes = sortData(DUMMY_TYPES).slice(0, limitTypes);

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
          {visibleRentals.map((city, index) => (
            <div key={index} className="flex justify-between items-center text-lg">
              <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
                {city.name}
              </span>
              <span className="text-gray-400">{city.count} casas</span>
            </div>
          ))}
{limitRentals < DUMMY_RENTALS.length ? (
            <button 
              onClick={() => setLimitRentals(DUMMY_RENTALS.length)}
              className="text-sm text-orange-400 hover:text-orange-600 font-medium mt-1 w-fit transition-colors underline"
            >
              Ver más {'>'}
            </button>
          ) : (
            <button 
              onClick={() => setLimitRentals(3)}
              className="text-sm text-orange-400 hover:text-orange-600 font-medium mt-1 w-fit transition-colors underline"
            >
              {'<'} Ver menos
            </button>
          )}
        </div>
      </section>

      {/* SECCIÓN: En venta */}
      <section className="mt-8">
        <h3 className="text-xl font-bold text-black mb-3 inline-block border-b-2 border-black pb-0.5">
          En venta
        </h3>
        
        <div className="flex flex-col gap-2 mt-2">
          {visibleSales.map((city, index) => (
            <div key={index} className="flex justify-between items-center text-lg">
              <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
                {city.name}
              </span>
              <span className="text-gray-400">{city.count} casas</span>
            </div>
          ))}

          {limitSales < DUMMY_SALES.length ? (
  <button 
    onClick={() => setLimitSales(DUMMY_SALES.length)}
    className="text-sm text-orange-400 hover:text-orange-600 font-medium mt-1 w-fit transition-colors underline"
  >
    Ver más {'>'}
  </button>
) : (
  <button 
    onClick={() => setLimitSales(3)}
    className="text-sm text-orange-400 hover:text-orange-600 font-medium mt-1 w-fit transition-colors underline"
  >
    {'<'} Ver menos
  </button>
)}
        </div>
      </section>

      {/* SECCIÓN: Por tipo de inmueble */}
      <section className="mt-8">
        <h3 className="text-xl font-bold text-black mb-3 inline-block border-b-2 border-black pb-0.5">
          Por tipo de inmueble
        </h3>
        
        <div className="flex flex-col gap-2 mt-2">
          {visibleTypes.map((type, index) => (
            <div key={index} className="flex justify-between items-center text-lg">
              <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
                {type.name}
              </span>
              <span className="text-gray-400">{type.count} propiedades</span>
            </div>
          ))}
{limitTypes < DUMMY_TYPES.length ? (
  <button 
    onClick={() => setLimitTypes(DUMMY_TYPES.length)}
    className="text-sm text-orange-400 hover:text-orange-600 font-medium mt-1 w-fit transition-colors underline"
  >
    Ver más {'>'}
  </button>
) : (
  <button 
    onClick={() => setLimitTypes(3)}
    className="text-sm text-orange-400 hover:text-orange-600 font-medium mt-1 w-fit transition-colors underline"
  >
    {'<'} Ver menos
  </button>
)}
        </div>
      </section>
    
    </aside>
  );
}