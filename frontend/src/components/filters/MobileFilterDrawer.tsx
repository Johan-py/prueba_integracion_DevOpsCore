'use client'

import { X, MapPin, DollarSign, Maximize, Tag, SlidersHorizontal, Award } from 'lucide-react'
import { CapacidadButton } from '../busqueda/capacidad/CapacidadButton'
import { OfertaButton } from '../busqueda/ofertas/OfertaButton'
import { useCompareStore } from '@/hooks/useCompareStore'
import { BarChart2 } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenZona: () => void;
  onOpenPrice: () => void;
  onOpenSuperficie: () => void;
  onOpenEtiquetas: () => void;
  onOpenAdvanced: () => void;
  isCapacidadActive: boolean;
  onToggleCapacidad: () => void;
  isOfertaActive: boolean;
  onToggleOferta: () => void;
}

export default function MobileFilterDrawer({
  isOpen, onClose, onOpenZona, onOpenPrice, onOpenSuperficie, onOpenEtiquetas, onOpenAdvanced,
  isCapacidadActive, onToggleCapacidad, isOfertaActive, onToggleOferta
}: MobileFilterDrawerProps) {
  const { isCompareMode, toggleCompareMode, selectedIds } = useCompareStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  if (!isOpen) return null;

  const btnClass = "flex items-center gap-3 p-4 bg-stone-50 rounded-xl w-full text-left font-medium text-stone-700 active:bg-stone-100 transition-colors border border-stone-200";

  return (
    <div className="fixed inset-0 z-[99999] flex">
      {/* Fondo oscuro clickeable para cerrar */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel lateral que entra por la izquierda */}
      <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h2 className="font-bold text-xl text-stone-800">Filtros</h2>
          <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm text-stone-500 active:scale-95"><X size={20} /></button>
        </div>
        
        <div className="p-5 flex flex-col gap-3 overflow-y-auto">
          <button onClick={() => { onClose(); onOpenZona(); }} className={btnClass}> <MapPin className="text-[#ea580c]"/> Buscar por Zona </button>
          <button onClick={() => { onClose(); onOpenPrice(); }} className={btnClass}> <DollarSign className="text-[#ea580c]"/> Rango de Precio </button>
          <button onClick={() => { onClose(); onOpenSuperficie(); }} className={btnClass}> <Maximize className="text-[#ea580c]"/> Metros Cuadrados </button>
          <button onClick={() => { onClose(); onOpenEtiquetas(); }} className={btnClass}> <Tag className="text-[#ea580c]"/> Etiquetas Especiales </button>
          
          {/* Adaptamos tus botones modulares */}
          <div className="w-full" onClick={onClose}>
            <CapacidadButton variant="home" isActive={isCapacidadActive} onClick={onToggleCapacidad} />
          </div>
          <div className="w-full" onClick={onClose}>
             <OfertaButton variant="home" isActive={isOfertaActive} onClick={onToggleOferta} />
          </div>
          
          <button onClick={() => { onClose(); onOpenAdvanced(); }} className={btnClass}> <SlidersHorizontal className="text-[#ea580c]"/> Más Filtros </button>
          <button onClick={() => { onClose(); toggleCompareMode(); }} className={btnClass}> 
            <BarChart2 className="text-[#ea580c]"/> Comparar {isCompareMode && `(${selectedIds.length})`} 
          </button>
        </div>
      </div>
    </div>
  )
}