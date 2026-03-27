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

        </div>
        
      </aside>
  );
}