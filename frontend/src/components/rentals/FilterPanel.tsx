'use client';

import { ArrowDownUp, Filter } from 'lucide-react';

export default function FilterPanel() {
  return (
    <aside className="w-full md:w-80 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">

    {/* CABECERA */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2 text-gray-900">
          <Filter size={20} className="text-orange-500" /> 
          <h2 className="text-lg font-bold">Filtros</h2>
        </div>

        {/* ORDENAR */}
        <div className="flex items-center gap-1 cursor-pointer group">
          <span className="text-sm font-medium text-orange-400 group-hover:text-orange-600">Ordenar</span>
          <ArrowDownUp size={16} className="text-orange-400 group-hover:text-orange-600" />
        </div>
      </div>

    {/* SECCIÓN: Alquileres */}
      <section className="mt-4">
        <h3 className="text-xl font-bold text-black mb-3 inline-block border-b-2 border-black pb-0.5">
          Alquileres
        </h3>
      </section>

    <div className="flex flex-col gap-2 mt-2">
          {/* Fila de ejemplo: Santa Cruz */}
          <div className="flex justify-between items-center text-lg">
            <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">Santa Cruz</span>
            <span className="text-gray-400">5000 casas</span>
          </div>

          {/* Fila de ejemplo: Cochabamba */}
          <div className="flex justify-between items-center text-lg">
            <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">Cochabamba</span>
            <span className="text-gray-400">2100 casas</span>
          </div>

          {/* ENLACE VER MÁS */}
          <button className="text-sm text-orange-400 hover:text-orange-600 font-medium mt-1 w-fit transition-colors">
            Ver más {'>'}
          </button>

        {/*SECCIÓN: En venta*/}
        <section className="mt-4">
        <h3 className="text-xl font-bold text-black mb-3 inline-block border-b-2 border-black pb-0.5">
            En venta
          </h3>
        </section>
          {/* Fila de ejemplo: Santa Cruz */}
          <div className="flex justify-between items-center text-lg">
            <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">Santa Cruz</span>
            <span className="text-gray-400">5000 casas</span>
          </div>
          {/* Fila de ejemplo: Cochabamba */}
          <div className="flex justify-between items-center text-lg">
            <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">Cochabamba</span>
            <span className="text-gray-400">2100 casas</span>
          </div>
            {/* ENLACE VER MÁS */}    
          <button className="text-sm text-orange-400 hover:text-orange-600 font-medium mt-1 w-fit transition-colors">
            Ver más {'>'}
          </button>

        {/* SECCIÓN: Por tipo de inmueble*/}
        <section className="mt-4">
        <h3 className="text-xl font-bold text-black mb-3 inline-block border-b-2 border-black pb-0.5">
            Por tipo de inmueble                                                                                                                                                                                                                                                                                    
          </h3>
        </section>
          {/* Fila de ejemplo: Casas */}
          <div className="flex justify-between items-center text-lg">
            <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">Casas</span> 
            <span className="text-gray-400">5000 casas</span>
          </div>
          {/* Fila de ejemplo: Departamentos */}
          <div className="flex justify-between items-center text-lg">
            <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">Departamentos</span>                   
            <span className="text-gray-400">2100 casas</span>
          </div>
            {/* ENLACE VER MÁS */}
          <button className="text-sm text-orange-400 hover:text-orange-600 font-medium mt-1 w-fit transition-colors">
            Ver más {'>'}
          </button> 
        </div>
      </aside>
  );
}