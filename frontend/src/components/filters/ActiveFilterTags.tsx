'use client'
// -- BitPro
// Pills de filtros activos + botón "Limpiar todo"

import { X, SlidersHorizontal } from 'lucide-react'
import { FiltroActivo } from '@/hooks/useFiltrosActivos'

interface ActiveFilterTagsProps {
  filtros: FiltroActivo[]
  onClearAll: () => void
}

export function ActiveFilterTags({ filtros, onClearAll }: ActiveFilterTagsProps) {
  // AC 4 & 6 — Si no hay filtros el componente desaparece completamente
  if (filtros.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 py-2.5 border-b border-orange-100 bg-orange-50/60">

      {/* Ícono indicador */}
      <SlidersHorizontal size={12} className="text-orange-400 shrink-0 mr-0.5" />

      {/* AC 4 — Pills individuales con su propio botón X */}
      {filtros.map((filtro) => (
        <span
          key={filtro.id}
          className="inline-flex items-center gap-1 bg-white border border-orange-200
                     text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full
                     shadow-sm transition-all hover:border-orange-300 hover:shadow"
        >
          {filtro.label}
          <button
            onClick={filtro.onRemove}
            className="ml-0.5 text-orange-300 hover:text-orange-600 transition-colors rounded-full"
            aria-label={`Quitar filtro ${filtro.label}`}
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        </span>
      ))}

      {/* AC 10 — Botón limpiar todo */}
      <button
        onClick={onClearAll}
        className="ml-auto text-xs text-stone-400 hover:text-red-500
                   underline underline-offset-2 transition-colors shrink-0"
      >
        Limpiar todo
      </button>
    </div>
  )
}