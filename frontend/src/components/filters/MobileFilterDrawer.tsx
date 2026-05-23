'use client'

import { useState } from 'react'
import { X, MapPin, DollarSign, Maximize, Tag, SlidersHorizontal, Award, ChevronDown, ChevronUp, Users } from 'lucide-react'
import PriceFilterSidebar from './PriceFilterSidebar'
import SuperficieFilterSidebar from './SuperficieFilterSidebar'
import EtiquetasSidebar from './EtiquetasSidebar'
import { UbicacionEspecificaPanel } from './UbicacionEspecificaPanel'
import { CapacidadSidebar } from './CapacidadSidebar'
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
  
  // Estado para controlar qué acordeón está abierto
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // Componente reutilizable para los botones del acordeón
  const AccordionButton = ({ id, icon: Icon, label, onClick }: any) => {
    const isExpanded = expandedSection === id;
    return (
      <button 
        onClick={onClick || (() => toggleSection(id))} 
        className={`flex items-center justify-between p-4 rounded-xl w-full text-left font-medium transition-all border ${isExpanded ? 'bg-orange-50 border-orange-200 text-orange-800 shadow-sm' : 'bg-stone-50 border-stone-200 text-stone-700 active:bg-stone-100'}`}
      >
        <div className="flex items-center gap-3">
          <Icon className={isExpanded ? "text-[#d97706]" : "text-stone-500"} /> 
          {label}
        </div>
        {!onClick && (isExpanded ? <ChevronUp size={18} className="text-[#d97706]"/> : <ChevronDown size={18} className="text-stone-400"/>)}
      </button>
    );
  };

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
        
        <div className="p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
          
          {/* Acordeones de Filtros */}
          <AccordionButton id="zona" icon={MapPin} label="Buscar por Zona" />
          {expandedSection === 'zona' && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-200">
              <UbicacionEspecificaPanel onClose={() => setExpandedSection(null)} onApply={() => { setExpandedSection(null); onClose(); }} />
            </div>
          )}

          <AccordionButton id="precio" icon={DollarSign} label="Rango de Precio" />
          {expandedSection === 'precio' && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-200">
              <PriceFilterSidebar isOpen={true} onClose={() => setExpandedSection(null)} />
            </div>
          )}

          <AccordionButton id="superficie" icon={Maximize} label="Metros Cuadrados" />
          {expandedSection === 'superficie' && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-200">
              <SuperficieFilterSidebar isOpen={true} onClose={() => setExpandedSection(null)} />
            </div>
          )}

          <AccordionButton id="etiquetas" icon={Tag} label="Etiquetas Especiales" />
          {expandedSection === 'etiquetas' && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-200">
              <EtiquetasSidebar isOpen={true} onClose={() => setExpandedSection(null)} />
            </div>
          )}
         
          <hr className="border-stone-100 my-1" />

          {/* Acordeón de Capacidad integrado */}
          <AccordionButton id="capacidad" icon={Users} label="Capacidad" />
          {expandedSection === 'capacidad' && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-200">
              <CapacidadSidebar 
                isOpen={true} 
                onClose={() => setExpandedSection(null)} 
                onApply={(dormitoriosMin, dormitoriosMax, banosMin, banosMax, tipoBano) => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('dormitoriosMin', dormitoriosMin.toString());
                  params.set('dormitoriosMax', dormitoriosMax.toString());
                  params.set('banosMin', banosMin.toString());
                  params.set('banosMax', banosMax.toString());
                  if (tipoBano && tipoBano !== 'cualquiera') params.set('tipoBano', tipoBano);
                  else params.delete('tipoBano');
                  router.push(`/busqueda_mapa?${params.toString()}`);
                  setExpandedSection(null);
                  onClose(); // Actualiza y cierra el drawer
                }} 
              />
            </div>
          )}

          {/* Botón de acción directa unificado para Ofertas */}
          <AccordionButton 
            id="ofertas" 
            icon={Award} 
            label={`Solo Ofertas ${isOfertaActive ? '(Activado)' : ''}`} 
            onClick={() => { onToggleOferta(); onClose(); }} 
          />
         
          <AccordionButton id="advanced" icon={SlidersHorizontal} label="Más Filtros" onClick={() => { onClose(); onOpenAdvanced(); }} />
          <AccordionButton id="compare" icon={BarChart2} label={`Comparar ${isCompareMode ? `(${selectedIds.length})` : ''}`} onClick={() => { onClose(); toggleCompareMode(); }} />
        </div>
      </div>
    </div>
  )
}