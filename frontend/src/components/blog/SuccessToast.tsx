'use client'

import { CheckCircle2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type SuccessToastProps = {
  message: string
  isOpen: boolean
  onClose: () => void
  duration?: number
}

export default function SuccessToast({
  message,
  isOpen,
  onClose,
  duration = 5000
}: SuccessToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 500) // Esperar a que termine la animación de salida
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isOpen) return null

  return (
    <div
      className={`fixed left-1/2 top-24 z-[110] w-full max-w-sm -translate-x-1/2 px-4 transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'
        }`}
    >
      <div className="relative flex items-center gap-4 overflow-hidden rounded-[24px] border border-stone-100 bg-white p-5 shadow-[0_20px_50px_-20px_rgba(41,37,36,0.15)]">
        {/* Icono de Éxito - Sistema PROPBOL */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#10b981]">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <div className="flex-1">
          <p className="font-montserrat text-sm font-bold tracking-tight text-stone-900">¡Éxito!</p>
          <p className="font-inter mt-0.5 text-xs leading-relaxed text-stone-600">{message}</p>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="rounded-xl p-2 text-stone-300 transition-colors hover:bg-stone-50 hover:text-stone-600"
          aria-label="Cerrar notificación"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Barra de progreso - Acento Semántico */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-[#10b981] transition-all duration-[5000ms] ease-linear"
          style={{ width: isVisible ? '100%' : '0%' }}
        />
      </div>
    </div>
  )
}
