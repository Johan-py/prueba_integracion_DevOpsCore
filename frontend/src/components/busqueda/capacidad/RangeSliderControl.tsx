'use client'

import { Bed, Bath } from 'lucide-react'

interface RangeSliderControlProps {
  label: 'dormitorios' | 'banos'  // ← tipo específico
  minValue: number
  maxValue: number
  absoluteMin: number
  absoluteMax: number
  onMinChange: (value: number) => void
  onMaxChange: (value: number) => void
  unit?: string
  hideTitle?: boolean
}

export function RangeSliderControl({
  label,
  minValue,
  maxValue,
  absoluteMin,
  absoluteMax,
  onMinChange,
  onMaxChange,
  unit = '+',
  hideTitle = false
}: RangeSliderControlProps) {
  const Icon = label === 'dormitorios' ? Bed : Bath
  const title = label === 'dormitorios' ? 'DORMITORIOS' : 'BAÑOS'
  
  return (
    <div className="space-y-3">
      {!hideTitle && (
        <div className="flex justify-between items-center">
          <span className="font-bold text-xs text-black uppercase tracking-wide flex items-center gap-2">
            {title}
            <Icon className="w-4 h-4 text-stone-500" />
          </span>
        </div>
      )}

      {/* Slider Mínimo */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-600 w-8">Min</span>
        <input
          type="range"
          min={absoluteMin}
          max={absoluteMax}
          step={1}
          value={minValue}
          onChange={(e) => onMinChange(Number(e.target.value))}
          className="flex-1 accent-[#d97706] h-2 rounded-lg"
        />
        <span className="text-xs text-stone-600 w-16 text-right">
          {minValue} {unit} 
        </span>
      </div>

      {/* Slider Máximo */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-600 w-8">Máx</span>
        <input
          type="range"
          min={absoluteMin}
          max={absoluteMax}
          step={1}
          value={maxValue}
          onChange={(e) => onMaxChange(Number(e.target.value))}
          className="flex-1 accent-[#d97706] h-2 rounded-lg"
        />
        <span className="text-xs text-stone-600 w-16 text-right">
          {maxValue} {unit}
        </span>
      </div>
    </div>
  )
}