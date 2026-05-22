
'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Props {
  descripcion: string
}

export default function DescripcionPropiedad({ descripcion }: Props) {
  const [expandido, setExpandido] = useState(false)

  const texto = descripcion || 'Sin descripción disponible'
  const textoCorto = texto.length > 220 ? `${texto.slice(0, 220)}...` : texto

  return (
    <section className="rounded-2xl border border-[#beb4a8] bg-[#ede7dc] px-6 py-5">
      <h2 className="mb-3 text-[18px] font-bold text-[#1f1f1f] md:text-[20px]">
        Descripción de la propiedad
      </h2>

      <p className="text-[15px] leading-6 text-[#5f5850]">
        {expandido ? texto : textoCorto}
      </p>

      {texto.length > 220 && (
        <button
          type="button"
          onClick={() => setExpandido((prev) => !prev)}
          className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#2b2b2b]"
        >
          {expandido ? 'Ver menos' : 'Ver toda la descripción'}
          <ChevronDown className={`h-4 w-4 transition ${expandido ? 'rotate-180' : ''}`} />
        </button>
      )}
    </section>
  )
}