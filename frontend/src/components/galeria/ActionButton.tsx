'use client'

import { Eye } from 'lucide-react'

interface ActionButtonProps {
  variant?: 'grid' | 'table'
  label?: string
  disabled?: boolean
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function ActionButton({
  variant = 'grid',
  label = 'Ver detalles',
  disabled = false,
  onClick
}: ActionButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onClick(e)
  }
  // --- VISTA TABLA ---
  if (variant === 'table') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        title={disabled ? 'No disponible en este modo' : 'Ver detalles'}
        className={`transition-transform duration-200 ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'
        }`}
      >
        <Eye className="w-4 h-4 text-[#E68B25]" />
      </button>
    )
  }

  // --- VISTA GRILLA ---
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`flex items-center justify-center w-full py-2.5 px-4 text-sm gap-2 rounded-lg font-medium transition-all duration-200 ${
        disabled
          ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
          : 'text-white shadow-sm bg-[#E68B25] hover:bg-amber-700'
      }`}
      title={disabled ? 'No disponible en este modo' : 'Ver detalles'}
    >
      <Eye className="w-5 h-5" />
      <span>{label}</span>
    </button>
  )
}