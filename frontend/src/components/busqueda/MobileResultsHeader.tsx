'use client'

import { Filter, LayoutGrid, List as ListIcon } from 'lucide-react'
import { MenuOrdenamiento } from './ordenamiento/MenuOrdenamiento'
import { EstadoOrdenamiento } from '@/types/inmueble'

interface MobileResultsHeaderProps {
  isScrolled: boolean;
  totalProperties: number;
  isClusterView: boolean;
  isRecomendadosActive: boolean;
  isofertaOpen: boolean;
  ordenActual: EstadoOrdenamiento;
  cambiarOrden: (orden: EstadoOrdenamiento) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  onClearCluster?: () => void;
}

export default function MobileResultsHeader({
  isScrolled,
  totalProperties,
  isClusterView,
  isRecomendadosActive,
  isofertaOpen,
  ordenActual,
  cambiarOrden,
  viewMode,
  setViewMode,
  onClearCluster
}: MobileResultsHeaderProps) {

  // Determinamos el título principal dinámicamente
  let mainTitle = 'Resultados de búsqueda'
  if (isClusterView) mainTitle = `${totalProperties} propiedades en este clúster`
  else if (isRecomendadosActive) mainTitle = 'Recomendados para ti'
  else if (isofertaOpen) mainTitle = 'Propiedades con precio reducido'

  return (
    <div className={`bg-white dark:bg-stone-900 shrink-0 border-b border-stone-200 dark:border-stone-800 shadow-sm transition-all duration-300 ${isScrolled ? 'py-2 px-3' : 'pt-4 pb-3 px-4'}`}>

      {/* ESTADO EXPANDIDO: Títulos y contadores (Se oculta al hacer scroll) */}
      <div className={`transition-all duration-300 overflow-hidden flex flex-col gap-3 ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-[150px] opacity-100'}`}>
        
        {/* Etiqueta Filtros superior */}
        <div className="flex items-center gap-1">
          <Filter className="w-4 h-4 text-[#ea580c]" />
          <h1 className="text-base font-semibold text-slate-800 dark:text-stone-200 uppercase tracking-wide">
            Filtros
          </h1>
        </div>

        {/* Título y cantidad */}
        <div>
          <h1 className="font-semibold text-slate-900 dark:text-stone-100 text-xl break-words line-clamp-2">
            {mainTitle}
          </h1>
          <h2 className="font-bold text-slate-900 dark:text-stone-100 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm mt-1">
            <div>
              <span className="text-[#ea580c]">{totalProperties}</span>
              <span className="ml-1 text-gray-600 dark:text-stone-400 font-normal">
                {totalProperties === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
              </span>
            </div>
            {isClusterView && onClearCluster && (
              <button onClick={onClearCluster} className="text-[#ea580c] hover:underline text-xs">
                (Volver)
              </button>
            )}
          </h2>
        </div>
      </div>

      {/* ESTADO COMPACTO / FILA INFERIOR: Ordenamiento y Vista */}
      <div className={`flex items-end justify-between gap-2 w-full transition-all duration-300 ${isScrolled ? 'mt-0' : 'mt-2'}`}>

        {/* Contador diminuto que aparece solo cuando se hace scroll */}
        <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap flex items-center ${isScrolled ? 'max-w-[100px] opacity-100 mr-1' : 'max-w-0 opacity-0 m-0'}`}>
           <span className="text-[#ea580c] font-bold text-sm">{totalProperties}</span>
           <span className="text-stone-500 text-xs ml-1 font-medium">props.</span>
        </div>

        {/* El menú de ordenamiento flex-1 empuja los botones de vista a la derecha */}
        <div className="flex-1 overflow-x-auto no-scrollbar">
          <MenuOrdenamiento
            totalResultados={totalProperties}
            ordenActual={ordenActual}
            onOrdenChange={cambiarOrden}
            isCompact={isScrolled} 
            embeddedInPanel
          />
        </div>

        {/* Botones Grid / List */}
        <div className="flex shrink-0 bg-stone-100 dark:bg-stone-800 p-1 rounded-md border border-stone-200 dark:border-stone-700 shadow-inner scale-90 origin-right">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-stone-700 text-[#ea580c] shadow-sm'
                : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-stone-700 text-[#ea580c] shadow-sm'
                : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <ListIcon size={16} />
          </button>
        </div>

      </div>
    </div>
  )
}