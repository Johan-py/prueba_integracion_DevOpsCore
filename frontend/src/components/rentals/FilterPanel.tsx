'use client';

import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { useFilterLogic } from '@/hooks/useFilterLogic';

// Función auxiliar para normalizar el texto (Cochabamba, Santa Cruz, etc.)
const formatName = (text: string) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export default function FilterPanel() {
  const [rentalsData, setRentalsData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [typesData, setTypesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const rentalsLogic = useFilterLogic();
  const salesLogic = useFilterLogic();
  const typesLogic = useFilterLogic();

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/filters');
        const result = await response.json();
        if (result.success) {
          setRentalsData(result.data.rentals);
          setSalesData(result.data.sales);
          setTypesData(result.data.categories);
        }
      } catch (error) {
        console.error("Error cargando datos reales:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFilters();
  }, []);

  if (loading) return <aside className="w-80 p-6 text-gray-500 italic">Sincronizando datos de PropBol...</aside>;

  return (
    <aside className="w-full md:w-80 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      
      {/* CABECERA */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2 text-gray-900">
          <Filter size={20} className="text-orange-500" /> 
          <h2 className="text-lg font-bold">Filtros</h2>
        </div>
        <button 
          onClick={rentalsLogic.toggleSort} 
          className="text-sm font-medium text-orange-400 hover:text-orange-600 outline-none"
        >
          {rentalsLogic.sortOrder === 'none' ? 'Ordenar' : rentalsLogic.sortOrder === 'asc' ? 'A↓' : 'A↑'}
        </button>
      </div>

      {/* SECCIÓN: ALQUILERES */}
      <section className="mt-4">
        <h3 className="text-xl font-bold text-black mb-3 border-b-2 border-black inline-block">Alquileres</h3>
        <div className="flex flex-col gap-2 mt-2">
          {rentalsLogic.getVisibleData(rentalsData).map((city: any, index: number) => (
            <div key={index} className="flex justify-between items-center text-lg gap-3">
              {/* Normalizamos el nombre aquí con formatName */}
              <span className="text-gray-400 hover:text-gray-600 cursor-pointer truncate flex-1">
                {formatName(city.name)}
              </span>
              <span className="text-gray-400 whitespace-nowrap">{city.count.toLocaleString()} casas</span>
            </div>
          ))}
          {rentalsLogic.viewLevel < 3 && rentalsData.length > 2 ? (
            <button onClick={rentalsLogic.handleSeeMore} className="text-sm text-orange-400 underline mt-1 w-fit">Ver más {'>'}</button>
          ) : rentalsData.length > 2 && (
            <button onClick={rentalsLogic.handleSeeLess} className="text-sm text-orange-400 underline mt-1 w-fit ml-auto">{'<'} Ver menos</button>
          )}
        </div>
      </section>

      {/* SECCIÓN: EN VENTA */}
      <section className="mt-8">
        <h3 className="text-xl font-bold text-black mb-3 border-b-2 border-black inline-block">En venta</h3>
        <div className="flex flex-col gap-2 mt-2">
          {salesLogic.getVisibleData(salesData).map((city: any, index: number) => (
            <div key={index} className="flex justify-between items-center text-lg gap-3">
              <span className="text-gray-400 hover:text-gray-600 cursor-pointer truncate flex-1">
                {formatName(city.name)}
              </span>
              <span className="text-gray-400 whitespace-nowrap">{city.count.toLocaleString()} casas</span>
            </div>
          ))}
          {salesLogic.viewLevel < 3 && salesData.length > 2 ? (
            <button onClick={salesLogic.handleSeeMore} className="text-sm text-orange-400 underline mt-1 w-fit">Ver más {'>'}</button>
          ) : salesData.length > 2 && (
            <button onClick={salesLogic.handleSeeLess} className="text-sm text-orange-400 underline mt-1 w-fit ml-auto">{'<'} Ver menos</button>
          )}
        </div>
      </section>

      {/* SECCIÓN: POR TIPO DE INMUEBLE (Título actualizado) */}
      <section className="mt-8">
        <h3 className="text-xl font-bold text-black mb-3 border-b-2 border-black inline-block">
          Por tipo de inmueble
        </h3>
        <div className="flex flex-col gap-2 mt-2">
          {typesLogic.getVisibleData(typesData).map((type: any, index: number) => (
            <div key={index} className="flex justify-between items-center text-lg gap-3">
              <span className="text-gray-400 hover:text-gray-600 cursor-pointer truncate flex-1">
                {formatName(type.name)}
              </span>
              <span className="text-gray-400">{type.count.toLocaleString()} propiedades</span>
            </div>
          ))}
          {typesLogic.viewLevel < 3 && typesData.length > 2 ? (
            <button onClick={typesLogic.handleSeeMore} className="text-sm text-orange-400 underline mt-1 w-fit">Ver más {'>'}</button>
          ) : typesData.length > 2 && (
            <button onClick={typesLogic.handleSeeLess} className="text-sm text-orange-400 underline mt-1 w-fit ml-auto">{'<'} Ver menos</button>
          )}
        </div>
      </section>
      
    </aside>
  );
}