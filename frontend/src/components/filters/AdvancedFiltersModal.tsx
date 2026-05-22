'use client'

import React, { useState, useEffect } from 'react'
import { X, Check, Plus } from 'lucide-react'
import { createPortal } from 'react-dom'

interface AdvancedFiltersModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (amenities: number[], labels: number[]) => void
}

// Datos basados en tu Mockup e IDs de base de datos
const AMENITIES_DATA = [
  { id: 1, name: 'Piscina' },
  { id: 2, name: 'Terraza' },
  { id: 3, name: 'Jardín' },
  { id: 4, name: 'Cochera' },
  { id: 5, name: 'Gimnasio' },
  { id: 6, name: 'Ascensor' },
  { id: 7, name: 'Aire' },
  { id: 8, name: 'Amueblado' },
  { id: 9, name: 'Parrillero' },
  { id: 10, name: 'Seguridad' },
]

const LABELS_DATA = [
  { id: 1, name: 'Inversión' },
  { id: 2, name: 'Preventa' },
  { id: 3, name: 'Nuevo' },
  { id: 4, name: 'Oferta' },
]

export default function AdvancedFiltersModal({ isOpen, onClose, onApply }: AdvancedFiltersModalProps) {
  const [mounted, setMounted] = useState(false)
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([])
  const [selectedLabels, setSelectedLabels] = useState<number[]>([])
  const [showAllAmenities, setShowAllAmenities] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  const toggleAmenity = (id: number) => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const toggleLabel = (id: number) => {
    setSelectedLabels(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  const handleClear = () => {
    setSelectedAmenities([])
    setSelectedLabels([])
  }

  const handleApply = () => {
    onApply(selectedAmenities, selectedLabels)
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Ventana del Modal */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-transparent dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-slate-800">
          <div className="flex-1" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 text-center">Filtros avanzados</h2>
          <div className="flex-1 flex justify-end">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-400 dark:text-slate-400"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8 space-y-8">
          
          {/* SECCIÓN AMENIDADES */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-4">Amenidades</h3>
            <div className="flex flex-wrap gap-3">
              {AMENITIES_DATA.slice(0, showAllAmenities ? undefined : 8).map((amenity) => {
                const isActive = selectedAmenities.includes(amenity.id)
                return (
                  <button
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    /* AQUI ESTÁ LA MAGIA: Solo coloreamos el texto y el borde en estado activo */
                    className={`
                      flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all
                      ${isActive
                        ? '!bg-transparent dark:!bg-slate-800 !border-[rgb(217,119,6)] !text-[rgb(217,119,6)] dark:!border-[rgb(232,124,30)] dark:!text-[rgb(232,124,30)]'
                        : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-[rgb(217,119,6)] dark:hover:border-[rgb(232,124,30)]'}
                    `}
                  >
                    {/* Al heredar el color del texto, el icono también se pinta de naranja automáticamente */}
                    {isActive && <Check size={16} strokeWidth={3} />}
                    {amenity.name}
                  </button>
                )
              })}
              
              {!showAllAmenities && (
                <button
                  onClick={() => setShowAllAmenities(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[rgb(217,119,6)] dark:text-[rgb(232,124,30)] text-sm font-bold hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <Plus size={16} /> Más
                </button>
              )}
            </div>
          </section>

          {/* SECCIÓN ETIQUETAS */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-4">Etiquetas</h3>
            <div className="flex flex-wrap gap-3">
              {LABELS_DATA.map((label) => {
                const isActive = selectedLabels.includes(label.id)
                return (
                  <button
                    key={label.id}
                    onClick={() => toggleLabel(label.id)}
                    /* Aplicamos el mismo estilo outline para las etiquetas */
                    className={`
                      px-6 py-2.5 rounded-full border text-sm font-medium transition-all
                      ${isActive
                        ? '!bg-transparent dark:!bg-slate-800 !border-[rgb(217,119,6)] !text-[rgb(217,119,6)] dark:!border-[rgb(232,124,30)] dark:!text-[rgb(232,124,30)]'
                        : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-[rgb(217,119,6)] dark:hover:border-[rgb(232,124,30)]'}
                    `}
                  >
                    {label.name}
                  </button>
                )
              })}
            </div>
          </section>

        </div>

        {/* Footer (Botones de acción) */}
        <div className="p-8 pt-4 flex items-center gap-4">
          <button
            onClick={handleClear}
            className="flex-1 py-4 text-stone-500 dark:text-slate-400 font-semibold hover:text-[rgb(217,119,6)] dark:hover:text-[rgb(232,124,30)] transition-colors underline"
          >
            Limpiar
          </button>
          <button
            onClick={handleApply}
            className="flex-[2] !bg-[rgb(217,119,6)] hover:!bg-[rgb(185,94,0)] !text-white py-4 rounded-[16px] font-bold shadow-lg shadow-orange-200/50 dark:shadow-none transition-all active:scale-95 border-none dark:!bg-[rgb(232,124,30)] dark:hover:!bg-[rgb(217,119,6)]"
          >
            Aplicar
          </button>
        </div>

      </div>
    </div>,
    document.body
  )
}