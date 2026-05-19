// frontend/src/components/layout/PropertyCard.tsx
'use client'
import { BedDouble, Bath, Maximize2, ImageOff, MapPin } from 'lucide-react'
import { normalizePropertyThumbnailUrl } from '@/lib/propertyThumbnailUrl'
import ContactButton from '../galeria/ContactButton' // <-- Tu botón modular importado
import ActionButton from '../galeria/ActionButton' // <-- Botón de ver detalles (opcional, lo puedes usar o no dependiendo de tu diseño)
import { useState } from 'react'
import ComoLlegarButton from '../galeria/ComoLlegarButton'
import { useCompareStore } from '@/hooks/useCompareStore'

type PropsTarjeta = {
  imagen?: string
  estado: string
  precioFormateado: string
  descripcion: string
  ubicacionTexto?: string
  categoriaTexto?: string
  accionTexto?: string
  camas: number
  banos: number
  metros: number
  lat?: number | null
  lng?: number | null
  precio?: number
  precio_anterior?: number
  esRecomendadoIA?: boolean 
  onViewDetails?: () => void
}

// 1. Definimos una constante para el color gris de fondo cuando no hay imagen
const COLOR_GRIS_PLACEHOLDER = 'bg-gray-200'

function formatMetros(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const rounded = Math.round(value * 100) / 100
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toLocaleString('es-BO', { maximumFractionDigits: 2 })
}

export default function PropertyCard({
  imagen,
  estado,
  precioFormateado,
  descripcion,
  ubicacionTexto,
  categoriaTexto,
  accionTexto,
  camas,
  banos,
  metros,
  lat,
  lng,
  onViewDetails,
  precio,
  precio_anterior,
  esRecomendadoIA
}: PropsTarjeta) {
  const [isHovered, setIsHovered] = useState(false)

  // Obtenemos el estado isCompareMode
  const { isCompareMode } = useCompareStore()

  // Calcular oferta HU6
  const precioNum = Number(precio)
  const precioAnteriorNum = Number(precio_anterior)
  const esOferta = !isNaN(precioAnteriorNum) && precioAnteriorNum > 0 && !isNaN(precioNum) && precioNum > 0 && precioNum < precioAnteriorNum
  const porcentajeDescuento = esOferta
    ? Math.round(((precioAnteriorNum - precioNum) / precioAnteriorNum) * 100)
    : 0

  console.log('📊 Datos oferta:', { precio, precio_anterior, esOferta })

  const formatPrice = (value?: number) => {
    if (!value) return ''
    return value.toLocaleString('es-BO')
  }

  const metrosLabel = formatMetros(metros)
  return (
    <div
      className="relative h-full bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-gray-100 group flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="absolute top-3 right-3 z-30 bg-white rounded-full shadow-md p-2 border border-gray-200">
          <MapPin className="w-5 h-5 text-[#ea580c]" />
        </div>
      )}
      {/* 2. Implementación de Imagen o Cuadro Gris (Misión Día 3) */}
      <div
        className={`relative aspect-video overflow-hidden ${!imagen ? COLOR_GRIS_PLACEHOLDER : ''} flex items-center justify-center`}
      >
        {imagen ? (
          <img
            src={normalizePropertyThumbnailUrl(imagen)}
            alt={descripcion}
            sizes="(max-w-7xl) 30vw"
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-house.jpg'
            }}
          />
        ) : (
          /* Icono de cámara tachada si no hay foto para que no se vea feo */
          <div className="flex flex-col items-center text-gray-400">
            <ImageOff className="w-12 h-12 mb-1" />
            <span className="text-[10px] font-medium uppercase">Sin foto disponible</span>
          </div>
        )}

        <span className="absolute top-3 left-3 bg-[#ea580c] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-sm shadow uppercase tracking-wider z-10">
          {estado}
        </span>

        {/* Badge de oferta HU6 */}
        {esOferta && (
          <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-bl-lg shadow-md z-10">
            {porcentajeDescuento}% OFF
          </span>
        )}
        {/* Badge IA */}
       {esRecomendadoIA && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full shadow-md z-10">
        ✨ Recomendado por IA
      </span>
       )}
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <h2 className="font-extrabold text-gray-950 tracking-tight text-xl md:text-2xl line-clamp-1 min-h-[2rem] md:min-h-[2.25rem]">
          {esOferta ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-orange-600">${formatPrice(precio)} USD</span>
              <span className="text-lg text-gray-400 line-through">
                ${formatPrice(precio_anterior)} USD
              </span>
            </div>
          ) : (
             <span className="text-orange-600">${formatPrice(precio)} USD</span>
          )}
        </h2>

        <p className="text-sm text-gray-900 line-clamp-2 font-medium leading-snug min-h-[2.5rem]">
          {descripcion}
        </p>

        <div className="rounded-xl border border-stone-200 bg-stone-50/90 p-2.5 min-h-[74px]">
          <p className="text-xs text-stone-700 font-medium line-clamp-2">
            {ubicacionTexto || 'Ubicación no especificada'}
          </p>
          <p className="text-xs text-stone-600 mt-1 line-clamp-1">
            Categoría: {categoriaTexto || estado}. Acción: {accionTexto || 'Sin acción'}.
          </p>
        </div>

        <div className="mt-auto border-t border-gray-100 pt-3">
          <div className="flex flex-wrap items-center justify-center gap-2 text-gray-700">
            <span
              className="inline-flex min-h-[2rem] items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 text-xs font-semibold tabular-nums whitespace-nowrap"
              title="Dormitorios"
            >
              <BedDouble className="h-3.5 w-3.5 shrink-0 text-[#ea580c]" aria-hidden />
              {camas}
            </span>
            <span
              className="inline-flex min-h-[2rem] items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 text-xs font-semibold tabular-nums whitespace-nowrap"
              title="Baños"
            >
              <Bath className="h-3.5 w-3.5 shrink-0 text-[#ea580c]" aria-hidden />
              {banos}
            </span>
            <span
              className="inline-flex min-h-[2rem] items-center justify-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 text-xs font-semibold tabular-nums whitespace-nowrap"
              title="Superficie"
            >
              <Maximize2 className="h-3.5 w-3.5 shrink-0 text-stone-500" aria-hidden />
              <span>
                {metrosLabel}
                <span className="text-stone-500 font-medium"> m²</span>
              </span>
            </span>
          </div>
        </div>

        {/* 3. Botón de contacto modular */}
        <div className="mt-1 w-full min-h-[44px] flex items-center">
          <ContactButton type="whatsapp" variant="grid" disabled={isCompareMode} />
        </div>
        {/* HU13 #68 #69 - Botón ¿Cómo llegar? visible sin scroll horizontal, con estado deshabilitado y tooltip */}
        <div className="mt-1 w-full min-h-[44px] flex items-center">
          <ComoLlegarButton lat={lat} lng={lng} variant="grid" disabled={isCompareMode} />
        </div>

        {/* 4. Botón de ver detalles (HU4 - Nuevo botón para abrir el detalle en una nueva pestaña) */}
        <div className="mt-2 w-full">
          <ActionButton
            variant="grid"
            label="Ver detalles"
            // Deshabilitamos ActionButton si está en modo comparación
            disabled={isCompareMode}
            onClick={(event) => {
              // HU4 - Evita disparar el click general del card
              event.stopPropagation()
              onViewDetails?.()
            }}
          />
        </div>
      </div>
    </div>
  )
}