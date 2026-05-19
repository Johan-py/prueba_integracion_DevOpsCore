'use client'

import { useEffect, useMemo, useState } from 'react'

interface Props {
  imagenes: Array<{
    id: number
    url: string
    tipo: string
    pesoMb: number | null
  }>
  titulo: string
  esOferta?: boolean
  porcentajeDescuento?: number
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')

function resolverUrlMultimedia(url: string) {
  if (!url) return '/placeholder-house.jpg'

  // Si ya viene absoluta (Cloudinary, YouTube, etc.), la dejamos tal cual
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // Si viene relativa desde backend, la apuntamos al backend
  if (url.startsWith('/')) {
    return `${API_URL}${url}`
  }

  return `${API_URL}/${url}`
}

export default function GaleriaPropiedad({ imagenes, titulo, esOferta, porcentajeDescuento }: Props) {
  const imagenesValidas = useMemo(
    () =>
      imagenes
        .filter((img) => img.tipo === 'IMAGEN')
        .map((img) => ({
          ...img,
          url: resolverUrlMultimedia(img.url)
        })),
    [imagenes]
  )

  const lista =
    imagenesValidas.length > 0
      ? imagenesValidas
      : [{ id: 0, url: '/placeholder-house.jpg', tipo: 'IMAGEN', pesoMb: null }]

  const [imagenPrincipal, setImagenPrincipal] = useState(lista[0].url)

  useEffect(() => {
    setImagenPrincipal(lista[0].url)
  }, [lista])

  return (
    <section className="grid gap-3 lg:grid-cols-[1.65fr_1fr]">
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={imagenPrincipal}
          alt={titulo}
          className="h-[260px] w-full object-cover sm:h-[320px] lg:h-[390px]"
        />
        {/* Badge de oferta */}
        {esOferta && (
          <div className="absolute top-0 right-0 z-10 bg-orange-500 text-white text-sm font-bold px-4 py-1.5 rounded-bl-lg shadow-md">
            {porcentajeDescuento}% OFF
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {lista.slice(0, 4).map((img, index) => {
          const esUltima = index === 3 && lista.length >= 4

          return (
            <button
              key={img.id}
              type="button"
              onClick={() => setImagenPrincipal(img.url)}
              className="relative overflow-hidden rounded-2xl"
            >
              <img
                src={img.url}
                alt={titulo}
                className="h-[123px] w-full object-cover transition duration-200 hover:scale-[1.02] sm:h-[150px] lg:h-[188px]"
              />

              {esUltima && (
                <div className="absolute bottom-3 right-3 rounded-xl bg-white/90 px-3 py-1 text-sm font-medium text-[#222]">
                  {lista.length} fotos
                </div>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}