// frontend/src/components/busqueda/capacidad/CapacidadButton.tsx
'use client'

import { Users, ChevronDown } from 'lucide-react'

interface CapacidadButtonProps {
  variant?: 'home' | 'map'
  isActive?: boolean
  onClick?: () => void
}

export function CapacidadButton({ variant = 'map', isActive = false, onClick }: CapacidadButtonProps) {
  // Para que se vea como "Píldora"
  const buttonStyles = variant === 'map' 
    ? `h-[40px] flex items-center gap-2 px-4 rounded-full border text-sm font-medium shadow-sm transition-all focus:outline-none shrink-0 ${
        isActive 
          ? 'bg-[#d97706] text-white border-[#d97706] dark:bg-[#E87C1E] dark:border-[#E87C1E]' 
          : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-[#d97706] dark:hover:border-[#E87C1E] dark:hover:bg-stone-700'
      }`
    : `h-[46px] w-full flex items-center justify-between border px-4 rounded-xl shadow-sm transition-all font-inter text-sm whitespace-nowrap gap-2 focus:outline-none ${
        isActive
          ? 'border-[#d97706] bg-[#d97706] text-white'
          : 'border-stone-300 text-stone-600 hover:border-[#d97706]'
      }`;
  return (
    <div className="shrink-0 relative">
      <button
        type="button"
        onClick={onClick}
        className={buttonStyles}
      >
        <div className="flex items-center gap-2">
          <Users className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500 dark:text-stone-400'}`} />
          <span>Capacidad</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isActive ? 'rotate-180 text-white' : 'text-stone-400 dark:text-stone-400 opacity-70'}`} />
      </button>
    </div>
  )
}