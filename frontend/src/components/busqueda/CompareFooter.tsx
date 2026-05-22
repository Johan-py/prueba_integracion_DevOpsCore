'use client'

import { useCompareStore } from '@/hooks/useCompareStore';
import { BarChart2, ArrowRight, Trash2 } from 'lucide-react';

interface CompareFooterProps {
  onOpenModal: () => void;
}

export default function CompareFooter({ onOpenModal }: CompareFooterProps) {
  // Extraemos también clearSelection del store
  const { isCompareMode, selectedIds, clearSelection } = useCompareStore();

  // Si no estamos en modo comparación, no renderizamos nada
  if (!isCompareMode) return null;

  const count = selectedIds.length;
  const isReady = count >= 2;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 md:pb-8 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-stone-900/90 backdrop-blur-md border border-stone-700 p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-10 duration-300">
         
          <div className="flex items-center gap-3">
            <div className="bg-[#E87C1E] p-2 rounded-xl shadow-lg shadow-orange-500/20">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                Comparador
              </span>
              <span className="text-sm font-semibold text-white">
                {count} {count === 1 ? 'seleccionado' : 'seleccionados'}
                <span className="text-stone-500 font-normal ml-1">(máx. 4)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Nuevo botón para Limpiar Selección (solo aparece si hay al menos 1 seleccionado) */}
            {count > 0 && (
              <button
                onClick={clearSelection}
                className="p-2.5 rounded-xl bg-stone-800 text-stone-400 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200"
                title="Limpiar selección"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              disabled={!isReady}
              onClick={onOpenModal}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200
                ${isReady
                  ? 'bg-white text-stone-900 hover:bg-[#E87C1E] hover:text-white shadow-lg active:scale-95'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-50'}
              `}
            >
              {isReady ? 'Ver comparativa' : 'Elige 2 o más'}
              <ArrowRight className={`w-4 h-4 ${isReady ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}