// frontend/src/components/filters/OfertaSidebar.tsx
'use client'

import { X, Flame, TrendingDown, Sparkles, Target, Gavel } from 'lucide-react'
import { useState } from 'react'

interface OfertaSidebarProps {
  isOpen: boolean
  onClose: () => void
}

type EtiquetaOferta = 'urgente' | 'negociable' | 'nueva' | 'oportunidad' | 'remate'

const ETIQUETAS: { id: EtiquetaOferta; label: string; icon: React.ElementType }[] = [
  { id: 'urgente', label: 'Urgente', icon: Flame },
  { id: 'negociable', label: 'Negociable', icon: TrendingDown },
  { id: 'nueva', label: 'Nueva', icon: Sparkles },
  { id: 'oportunidad', label: 'Oportunidad', icon: Target },
  { id: 'remate', label: 'Remate', icon: Gavel }
]

export function OfertaSidebar({ isOpen, onClose }: OfertaSidebarProps) {
  const [soloOfertas, setSoloOfertas] = useState(true)
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<EtiquetaOferta[]>([])

  const toggleEtiqueta = (id: EtiquetaOferta) => {
    setEtiquetasSeleccionadas(prev =>
      prev.includes(id)
        ? prev.filter(e => e !== id)
        : [...prev, id]
    )
  }

  if (!isOpen) return null

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* Header */}
      <div className="p-4 relative flex items-center justify-center shrink-0">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide text-center pb-0">
          OFERTAS
        </h3>
        <button
          onClick={onClose}
          className="absolute right-4 p-1 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X size={20} className="text-stone-400" />
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-5 pt-2 space-y-5">
        
        {/* Checkbox: Solo propiedades con precio reducido */}
        <div>
          <label className="flex items-center gap-3 text-sm text-stone-800 font-normal cursor-pointer">
            <div className="relative inline-flex shadow-sm">
              <input
                type="checkbox"
                checked={soloOfertas}
                onChange={() => setSoloOfertas(!soloOfertas)}
                className={`
                  w-[28px] h-[18px] rounded border cursor-pointer appearance-none
                  ${soloOfertas
                    ? 'bg-[#d97706] border-[#d97706]'
                    : 'bg-white border-gray-400'
                  }
                `}
              />
              {soloOfertas && (
                <svg
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[11px] h-[11px] pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="3"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                >
                  <polyline points="4 12 10 18 20 6" />
                </svg>
              )}
            </div>
            <span>Solo propiedades con precio reducido</span>
          </label>
        </div>

        {/* Etiquetas de oferta - COMO BOTONES MÁS GRANDES Y CENTRADOS */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">
            Etiquetas de oferta
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {ETIQUETAS.map(({ id, label, icon: Icon }) => {
              const isSelected = etiquetasSeleccionadas.includes(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleEtiqueta(id)}
                  className={`
                    flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium tracking-wid transition-all
                    ${isSelected
                      ? 'bg-[#d97706] text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-stone-700'}`} />
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
        </div>

      </div>

      {/* Botones - Estilo CapacidadSidebar */}
      <div className="shrink-0 px-4 pb-4 pt-2 bg-white border-t border-stone-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <button
          onClick={() => {
            setSoloOfertas(true)
            setEtiquetasSeleccionadas([])
          }}
          className="w-full mb-3 text-gray-700 text-xs underline underline-offset-4 hover:text-gray-900 transition-colors"
        >
          Limpiar Filtros
        </button>
        <button
          onClick={() => {
            console.log('Aplicar filtro:', {
              soloOfertas,
              etiquetas: etiquetasSeleccionadas
            })
          }}
          className="w-full py-2.5 text-white bg-[#d97706] rounded-lg hover:bg-[#b95e00] transition-colors font-medium shadow-md active:scale-95"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}