'use client'
import { Inmueble } from '../../types/inmueble'
import { BedDouble, Bath, Maximize, MapPin, Star, Check, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useCompareStore } from '@/hooks/useCompareStore'

interface TarjetaInmuebleProps {
  inmueble: Inmueble
  posicion?: number
  esRecomendadoIA?: boolean
}

export const TarjetaInmueble = ({ inmueble, posicion, esRecomendadoIA }: TarjetaInmuebleProps) => {
  const [isHovered, setIsHovered] = useState(false)
  
  // Conectamos la tarjeta al estado global de comparación
  const { isCompareMode, selectedIds, toggleProperty } = useCompareStore()
  const isSelected = isCompareMode && selectedIds.includes(String(inmueble.id))

  const formatoMoneda = new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  })

  const ubicacionTexto =
    typeof inmueble.ubicacion === 'object' && inmueble.ubicacion !== null
      ? `${inmueble.ubicacion.zona ?? ''}, ${inmueble.ubicacion.ciudad ?? ''}`
      : ''

  const handleClick = async () => {
    // Si la función comparar está activa, el clic solo selecciona la tarjeta
    if (isCompareMode) {
      toggleProperty(String(inmueble.id))
      return
    }

    // Comportamiento normal (telemetría y navegación)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      await fetch('/api/telemetria/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          inmuebleId: inmueble.id,
          posicionLista: posicion,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Error tracking click:', error)
    }
  }

  return (
    <div
      className={`group flex flex-col w-full rounded-[16px] shadow-sm border-2 overflow-hidden transition-all duration-300 cursor-pointer relative
        ${isSelected
          ? '!outline !outline-4 !outline-[rgb(234,88,12)] !border-transparent scale-[0.98] shadow-lg bg-orange-50/30 dark:!bg-stone-800/80 z-10'
          : 'bg-white dark:bg-stone-900 border-gray-100 dark:border-stone-800 hover:shadow-md hover:border-gray-200 dark:hover:border-stone-700'
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Icono de Check Naranja de PropBol cuando está seleccionado */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-20 !bg-[rgb(234,88,12)] text-white p-1.5 rounded-full shadow-md">
          <Check size={16} strokeWidth={3} />
        </div>
      )}

      <div className="relative aspect-[4/3] w-full bg-gray-200 dark:bg-stone-800 overflow-hidden">
        <Image
          src={`https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600&h=400&ixlib=rb-4.0.3`}
          alt={inmueble.titulo}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-in-out"
          width={600}
          height={400}
        />
        {(inmueble.popularidad ?? 0) > 80 && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-stone-900/90 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-semibold text-gray-800 dark:text-stone-200">Popular</span>
          </div>
        )}
        {/* Badge IA — agregar aquí */}
        {esRecomendadoIA && (
          <div className="absolute bottom-3 left-3 bg-purple-600 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
            <span className="text-xs">✨</span>
           <span className="text-xs font-semibold">Recomendado por IA</span>
         </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-stone-100 leading-tight line-clamp-1">
            {inmueble.titulo}
          </h3>
          <span
            className={`whitespace-nowrap ml-2 font-bold transition-all duration-300 ${
              isHovered || isSelected
                ? 'text-base text-[rgb(234,88,12)] dark:text-[rgb(234,88,12)]'
                : 'text-xs text-gray-900 dark:text-stone-300'
            }`}
          >
            {formatoMoneda.format(Number(inmueble.precio))}
          </span>
        </div>

        <div className="flex items-center text-gray-500 dark:text-stone-400 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1 opacity-70 flex-shrink-0" />
          <span className="line-clamp-1">{ubicacionTexto}</span>
        </div>

        <div className="mt-auto border-t border-gray-100 dark:border-stone-800 pt-3 flex items-center justify-between text-gray-600 dark:text-stone-400 text-sm font-medium">
          <div className="flex items-center gap-1.5" title="Habitaciones">
            <BedDouble className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span>{inmueble.nroCuartos ?? '-'}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Baños">
            <Bath className="w-4 h-4 text-[rgb(234,88,12)] dark:text-[rgb(234,88,12)]" />
            <span>{inmueble.nroBanos ?? '-'}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Superficie total">
            <Maximize className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span>{inmueble.superficieM2 ?? '-'} m²</span>
          </div>
        </div>
      </div>
    </div>
  )
}