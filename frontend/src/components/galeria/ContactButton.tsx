'use client'

import { MessageCircle, MessageSquare } from 'lucide-react'

interface ContactButtonProps {
  type: string // Puede ser 'whatsapp' o 'messenger'
  phoneNumber?: string
  variant?: 'grid' | 'table'
}

export default function ContactButton({ 
  type, 
  phoneNumber = "59170000000", 
  variant = 'grid' 
}: ContactButtonProps) {
  
  const isWhatsApp = type === 'whatsapp'
  
  // Lógica principal (Tu tarea T7)
  const handleClick = () => {
    const url = isWhatsApp 
      ? `https://wa.me/${phoneNumber}?text=Hola,%20estoy%20interesado%20en%20esta%20propiedad`
      : `https://m.me/tu_pagina_facebook` // Ejemplo para Messenger
    window.open(url, '_blank')
  }

  // --- VISTA TABLA (Respeta el diseño de tu compañero) ---
  if (variant === 'table') {
    return (
      <button 
        onClick={handleClick} 
        title={isWhatsApp ? "Contactar por WhatsApp" : "Contactar por Messenger"}
        className="hover:scale-110 transition-transform duration-200"
      >
        {isWhatsApp ? (
          <MessageCircle className="w-4 h-4 text-green-500 cursor-pointer" />
        ) : (
          <MessageSquare className="w-4 h-4 text-blue-500 cursor-pointer" />
        )}
      </button>
    )
  }

  // --- VISTA GRILLA (El botón grande y bonito que espera el Dev 3) ---
  return (
    <button 
      onClick={handleClick}
      className={`flex items-center justify-center w-full py-2.5 px-4 text-sm gap-2 rounded-lg font-medium transition-all duration-200 text-white shadow-sm ${
        isWhatsApp ? "bg-[#25D366] hover:bg-[#20ba5a]" : "bg-[#0084FF] hover:bg-[#0073e6]"
      }`}
      title={isWhatsApp ? "Contactar por WhatsApp" : "Contactar por Messenger"}
    >
      {isWhatsApp ? <MessageCircle className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      <span>Contactar</span>
    </button>
  )
}