'use client'

import { MessageCircle, MessageSquare } from 'lucide-react'
import { JSX } from 'react'

interface ContactButtonProps {
  type: 'whatsapp' | 'messenger'
  phoneNumber?: string
  variant?: 'grid' | 'table'
  disabled?: boolean
}

export default function ContactButton({
  type,
  phoneNumber = '59170000000',
  variant = 'grid',
  disabled = false
}: ContactButtonProps): JSX.Element {
  const isWhatsApp = type === 'whatsapp'

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Si está deshabilitado, evitamos el comportamiento por defecto y detenemos la propagación
    if (disabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
    }
    const url = isWhatsApp
      ? `https://wa.me/${phoneNumber}?text=Hola,%20estoy%20interesado%20en%20esta%20propiedad`
      : `https://m.me/tu_pagina_facebook`
    window.open(url, '_blank')
  }

  // --- VISTA TABLA (Respeta el diseño de tu compañero) ---
  if (variant === 'table') {
    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        title={isWhatsApp ? 'Contactar por WhatsApp' : 'Contactar por Messenger'}
        className={`transition-transform duration-200 ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}`}
      >
        {isWhatsApp ? (
          <MessageCircle className="w-4 h-4 text-green-500" />
        ) : (
          <MessageSquare className="w-4 h-4 text-blue-500" />
        )}
      </button>
    )
  }

  // --- VISTA GRILLA ---
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`flex items-center justify-center w-full py-2.5 px-4 text-sm gap-2 rounded-lg font-medium transition-all duration-200 shadow-sm ${
        disabled 
            ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none' 
            : `text-white ${isWhatsApp ? 'bg-[#25D366] hover:bg-[#20ba5a]' : 'bg-[#0084FF] hover:bg-[#0073e6]'}`
      }`}
      title={isWhatsApp ? 'Contactar por WhatsApp' : 'Contactar por Messenger'}
    >
      {isWhatsApp ? <MessageCircle className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      <span>Contactar</span>
    </button>
  )
}