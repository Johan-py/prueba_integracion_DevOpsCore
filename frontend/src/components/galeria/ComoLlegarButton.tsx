'use client'
import { MapPin } from 'lucide-react'
import { useMapRedirect } from '@/hooks/useMapRedirect'
import { useRef } from 'react'
interface ComoLlegarButtonProps {
  lat?: number | null
  lng?: number | null
  variant?: 'grid' | 'table'
  disabled?: boolean
}
export default function ComoLlegarButton({ lat, lng, variant = 'grid', disabled = false }: ComoLlegarButtonProps) {
  const { openMap } = useMapRedirect()
  const isRedirecting = useRef(false)
  // #69 - Coordenadas validadas en rango geografico valido
  const hasLocation =
    lat != null && lng != null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  // Combinamos la lógica: está deshabilitado si no hay ubicación o si se pasa por prop (modo comparar)
  const isButtonDisabled = !hasLocation || disabled
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (!hasLocation || isRedirecting.current || isButtonDisabled) return
    isRedirecting.current = true
    openMap(lat!, lng!)
    setTimeout(() => {
      isRedirecting.current = false
    }, 2000)
  }
  if (variant === 'table') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isButtonDisabled}
        title={hasLocation ? '¿Cómo llegar?' : 'Ubicación no disponible'}
        aria-label="Calcular ruta hacia la propiedad en el mapa"
        data-testid="como-llegar-btn"
        style={{ touchAction: 'manipulation' }}
        className="hover:scale-110 transition-transform duration-200 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <MapPin className="w-4 h-4 text-[#ea580c]" />
      </button>
    )
  }
  return (
    <div className="relative w-full group/btn">
      {!hasLocation && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:block z-50">
          <div className="bg-stone-800 text-white text-xs px-3 py-1.5 rounded-md whitespace-nowrap">
            Ubicación no disponible
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-800" />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={isButtonDisabled}
        aria-label="Calcular ruta hacia la propiedad en el mapa"
        data-testid="como-llegar-btn"
        title={hasLocation ? '¿Cómo llegar?' : 'Ubicación no disponible'}
        style={{ touchAction: 'manipulation' }}
        className="flex items-center justify-center w-full py-2.5 px-4 text-sm gap-2 rounded-lg font-medium transition-all duration-200 text-white shadow-sm bg-[#ea580c] hover:bg-[#c2410c] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed disabled:shadow-none"
      >
        <MapPin className="w-5 h-5" />
        <span>¿Cómo llegar?</span>
      </button>
    </div>
  )
}
