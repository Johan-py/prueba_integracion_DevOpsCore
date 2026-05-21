'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
interface PriceFilterSidebarProps {
  isOpen: boolean;  
  onClose: () => void;
  totalResultados?: number;
}
export default function PriceFilterSidebar({ isOpen, onClose, totalResultados = -1 }: PriceFilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [moneda, setMoneda] = useState<'BOB' | 'USD'>((searchParams.get('currency') as 'BOB' | 'USD') || 'USD')
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '')
  const [displayMin, setDisplayMin] = useState<string>('')
  const [displayMax, setDisplayMax] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [filtroAplicado, setFiltroAplicado] = useState(!!searchParams.get('minPrice') || !!searchParams.get('maxPrice'))  

  const formatCurrency = (val: string): string => {
    if (!val) return ''
    const num = Number(val)
    if (isNaN(num)) return ''
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(num)
  }

  // Convierte "10.000,50" o "10.10.10" a "10000.50" (Número real limpio)
  const parseCurrency = (val: string): string => {
    if (!val) return ''
    let cleaned = val.replace(/[^\d.,]/g, '')
    cleaned = cleaned.replace(/\./g, '')
    const parts = cleaned.split(',')
    if (parts.length > 1) {
      cleaned = parts[0] + '.' + parts.slice(1).join('')
    }
    return cleaned
  }

  useEffect(() => { setDisplayMin(minPrice ? formatCurrency(minPrice) : '') }, [minPrice])
  useEffect(() => { setDisplayMax(maxPrice ? formatCurrency(maxPrice) : '') }, [maxPrice])

  // Cargar valores iniciales desde la URL al abrir
  useEffect(() => {
    if (isOpen) {
      setMinPrice(searchParams.get('minPrice') || '')
      setMaxPrice(searchParams.get('maxPrice') || '')
      setMoneda((searchParams.get('currency') as 'BOB' | 'USD') || 'USD')
      setError('')
    }
  }, [isOpen, searchParams])

  if (!isOpen) return null;

  const handleApply = () => {
    if (Number(minPrice) < 0 || Number(maxPrice) < 0) {
      setError('Solo se permiten números positivos')
      return
    }
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      setError('El precio mínimo no puede ser mayor al máximo')
      return
    }

    // Actualizar URL
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) params.set('minPrice', minPrice)
    else params.delete('minPrice')

    if (maxPrice) params.set('maxPrice', maxPrice)
    else params.delete('maxPrice')

    params.set('currency', moneda)

    router.push(`/busqueda_mapa?${params.toString()}`)
    setFiltroAplicado(true)
    onClose()
  }

  const LIMITE_MAX = moneda === 'USD' ? 500000 : 3500000

  const handleMonedaChange = (nuevaMoneda: 'BOB' | 'USD') => {
    setMoneda(nuevaMoneda)
    setMinPrice('')
    setMaxPrice('')
    setError('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur() 
      setTimeout(() => {
        document.getElementById('btn-aplicar-precio')?.click()
      }, 100) // Breve pausa para asegurar que React actualizó los estados antes de aplicar
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* 1. HEADER (Fijo) */}
      <div className="shrink-0 p-4 pb-2 relative flex flex-col items-center justify-center">
        <div className="w-full flex items-center justify-center relative mb-1">
          <h3 className="font-bold text-sm text-stone-800 uppercase tracking-wide text-center">
            Filtrar por Precio
          </h3>
          <button
            onClick={onClose}
            className="absolute right-0 p-1 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={20} className="text-stone-500" />
          </button>
        </div>
        <p className="text-sm text-stone-500 mb-4 text-center">Seleccione el tipo de moneda:</p>
        {/* Toggle de Moneda */}
        <div className="flex bg-stone-100 rounded-full p-1 w-fit shadow-inner mx-auto">
          <button
            onClick={() => handleMonedaChange('BOB')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              moneda === 'BOB'
                ? 'bg-[#d97706] text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            $BOB
          </button>
          <button
            onClick={() => handleMonedaChange('USD')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              moneda === 'USD'
                ? 'bg-[#d97706] text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            $USD
          </button>
        </div>
      </div>

      {/* 2. CONTENIDO (Con Scroll) */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
        {/* Inputs Desde / Hasta */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600 w-12">Desde:</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Min"
              value={displayMin}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d.,]/g, '')
                setDisplayMin(val)
                setError('')
              }}
              onBlur={() => {
                const parsed = parseCurrency(displayMin)
                setMinPrice(parsed)
                setDisplayMin(formatCurrency(parsed))
              }}
              onKeyDown={handleKeyDown}
              className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600 w-12">Hasta:</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Máx"
              value={displayMax}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d.,]/g, '')
                setDisplayMax(val)
                setError('')
              }}
              onBlur={() => {
                const parsed = parseCurrency(displayMax)
                setMaxPrice(parsed)
                setDisplayMax(formatCurrency(parsed))
              }}
              onKeyDown={handleKeyDown}
              className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-all"
            />
          </div>
        </div>
        
        {error && (
          <p className="text-red-500 text-xs">{error}</p>
        )}
        {!error && minPrice && maxPrice && Number(minPrice) > Number(maxPrice) && (
          <p className="text-red-500 text-xs">
            El precio mínimo no puede ser mayor al máximo
          </p>
        )}

        {/* Sliders bidireccionales sincronizados con inputs */}
        <div className="flex flex-col gap-3">
          <label className="font-bold text-xs text-stone-400 uppercase tracking-wide">
            Rango de Precio
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 w-8">Min</span>
            <input
              type="range" min="0" max={LIMITE_MAX} step="100"
              value={Number(minPrice) || 0}
              onChange={(e) => { setMinPrice(e.target.value); setError('') }}
              className="flex-1 accent-[#d97706]"
            />
            <span className="text-xs text-stone-600 w-20 text-right">
              {formatCurrency(minPrice) || '0'} {moneda}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 w-8">Máx</span>
            <input
              type="range" min="0" max={LIMITE_MAX} step="100"
              value={Number(maxPrice) || LIMITE_MAX}
              onChange={(e) => { setMaxPrice(e.target.value); setError('') }}
              className="flex-1 accent-[#d97706]"
            />
            <span className="text-xs text-stone-600 w-20 text-right">
              {maxPrice ? formatCurrency(maxPrice) : `${(LIMITE_MAX/1000).toLocaleString('de-DE')}K`} {moneda}
            </span>
          </div>
        </div>

        {/* Empty state cuando no hay resultados */}
        {filtroAplicado && totalResultados === 0 && (
          <div className="flex flex-col items-center gap-2 py-3 text-center">
            <span className="text-xl">🔍</span>
            <p className="text-sm font-semibold text-stone-700">Sin resultados</p>
            <p className="text-xs text-stone-400">
              No se encontraron propiedades dentro del rango de precio seleccionado
            </p>
          </div>
        )}
      </div>

      {/* 3. FOOTER (Fijo al fondo) */}
      <div className="shrink-0 px-6 pb-6 pt-4 border-t border-stone-100 bg-white dark:border-stone-800 dark:bg-stone-900 relative">
        
        <style dangerouslySetInnerHTML={{__html: `
          html body #btn-aplicar-precio {
            background-color: #d97706 !important;
            color: #ffffff !important;
          }
          html body #btn-aplicar-precio:hover {
            background-color: #b95e00 !important;
          }
          html.dark body #btn-aplicar-precio {
            background-color: #E87C1E !important;
          }
          html.dark body #btn-aplicar-precio:hover {
            background-color: #d97706 !important;
          }
        `}} />

        <button
          type="button"
          onClick={() => {
            setMinPrice(''); setMaxPrice(''); setError(''); setFiltroAplicado(false)
            const params = new URLSearchParams(searchParams.toString())
            params.delete('minPrice'); params.delete('maxPrice')
            params.delete('currency')
            router.push(`/busqueda_mapa?${params.toString()}`)
          }}
          className="text-xs text-stone-400 hover:text-[#d97706] dark:text-stone-400 dark:hover:text-[#E87C1E] transition-colors underline text-center w-full mb-3"
        >
          Limpiar filtro
        </button>

        {/* Botón Aplicar */}
        <button
          id="btn-aplicar-precio"
          onClick={handleApply}
          className="rounded-[12px] font-bold py-3 px-4 w-full transition-all active:scale-95 shadow-md border-none"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}