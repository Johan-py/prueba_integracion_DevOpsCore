'use client'


import { X, Bath } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { RangeSliderControl } from '../busqueda/capacidad/RangeSliderControl'

type TipoBano = 'cualquiera' | 'privado' | 'compartido'

const DEFAULT_DORM_MIN = 1
const DEFAULT_DORM_MAX = 10
const DEFAULT_BANOS_MIN = 1
const DEFAULT_BANOS_MAX = 10

interface CapacidadSidebarProps {
  isOpen: boolean
  onClose: () => void
  onApply?: (
    dormitoriosMin: number,
    dormitoriosMax: number,
    banosMin: number,
    banosMax: number,
    tipoBano: TipoBano
  ) => void
}

export function CapacidadSidebar({ isOpen, onClose, onApply }: CapacidadSidebarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [dormitoriosMin, setDormitoriosMin] = useState(DEFAULT_DORM_MIN)
  const [dormitoriosMax, setDormitoriosMax] = useState(DEFAULT_DORM_MAX)
  const [banosMin, setBanosMin] = useState(DEFAULT_BANOS_MIN)
  const [banosMax, setBanosMax] = useState(DEFAULT_BANOS_MAX)
  const [tipoBano, setTipoBano] = useState<TipoBano>('cualquiera')
  const [dormitoriosError, setDormitoriosError] = useState('')
  const [banosError, setBanosError] = useState('')

  // Cargar valores desde la URL al abrir el panel
  useEffect(() => {
    if (isOpen) {
      const dormMin = searchParams.get('dormitoriosMin')
      const dormMax = searchParams.get('dormitoriosMax')
      const banMin = searchParams.get('banosMin')
      const banMax = searchParams.get('banosMax')
      const tipo = searchParams.get('tipoBano') as TipoBano

      if (dormMin) setDormitoriosMin(parseInt(dormMin))
      if (dormMax) setDormitoriosMax(parseInt(dormMax))
      if (banMin) setBanosMin(parseInt(banMin))
      if (banMax) setBanosMax(parseInt(banMax))
      if (tipo && ['cualquiera', 'privado', 'compartido'].includes(tipo)) setTipoBano(tipo)
    }
  }, [isOpen, searchParams])

  // Validación: min no puede superar a max
  const handleDormitoriosMinChange = (val: number) => {
    if (val <= dormitoriosMax) {
      setDormitoriosMin(val)
      setDormitoriosError('')
    } else {
      setDormitoriosError('El mínimo no puede ser mayor que el máximo')
    }
  }

  const handleDormitoriosMaxChange = (val: number) => {
    if (val >= dormitoriosMin) {
      setDormitoriosMax(val)
      setDormitoriosError('')
    } else {
      setDormitoriosError('El máximo no puede ser menor que el mínimo')
    }
  }

  const handleBanosMinChange = (val: number) => {
    if (val <= banosMax) {
      setBanosMin(val)
      setBanosError('')
    } else {
      setBanosError('El mínimo no puede ser mayor que el máximo')
    }
  }

  const handleBanosMaxChange = (val: number) => {
    if (val >= banosMin) {
      setBanosMax(val)
      setBanosError('')
    } else {
      setBanosError('El máximo no puede ser menor que el mínimo')
    }
  }

  // Limpiar filtros
  const handleClear = () => {
    setDormitoriosMin(DEFAULT_DORM_MIN)
    setDormitoriosMax(DEFAULT_DORM_MAX)
    setBanosMin(DEFAULT_BANOS_MIN)
    setBanosMax(DEFAULT_BANOS_MAX)
    setTipoBano('cualquiera')
    setDormitoriosError('')
    setBanosError('')

    const params = new URLSearchParams(searchParams.toString())
    params.delete('dormitoriosMin')
    params.delete('dormitoriosMax')
    params.delete('banosMin')
    params.delete('banosMax')
    params.delete('tipoBano')

    router.push(`/busqueda_mapa?${params.toString()}`)
  }

  if (!isOpen) return null

  const handleApply = () => {
    if (onApply) {
      onApply(dormitoriosMin, dormitoriosMax, banosMin, banosMax, tipoBano)
    }
    onClose()
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* 1. HEADER (Fijo) */}
      <div className="shrink-0">
        <div className="p-4 relative flex items-center justify-center">
          <h3 className="font-bold text-sm text-stone-800 uppercase tracking-wide text-center">
            CAPACIDAD
          </h3>
          <button
            onClick={onClose}
            className="absolute right-4 p-1 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={20} className="text-stone-500" />
          </button>
        </div>

        <div className="px-4 pt-0 pb-1">
          <p className="text-sm text-gray-700 text-center">
            Selecciona el rango de dormitorios y baños deseados
          </p>
        </div>
      </div>

      {/* 2. CONTENIDO (Con Scroll: flex-1 + overflow-y-auto) */}
      <div className="flex-1 overflow-y-auto px-6 pt-5 space-y-6 custom-scrollbar pb-6">
        {/* DORMITORIOS */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-xs text-black uppercase tracking-wide">
              DORMITORIOS
            </span>
            <button
              onClick={() => {
                setDormitoriosMin(DEFAULT_DORM_MIN)
                setDormitoriosMax(DEFAULT_DORM_MAX)
                setDormitoriosError('')
              }}
              className="text-[#d97706] hover:text-gray-600 text-xs font-bold"
              title="Restablecer filtros de dormitorios"
            >
              Reset
            </button>
          </div>

          <RangeSliderControl
            label="dormitorios"
            minValue={dormitoriosMin}
            maxValue={dormitoriosMax}
            absoluteMin={1}
            absoluteMax={10}
            onMinChange={handleDormitoriosMinChange}
            onMaxChange={handleDormitoriosMaxChange}
            unit="+"
            hideTitle={true}
          />
          {dormitoriosError && <p className="text-xs text-red-500 mt-1">{dormitoriosError}</p>}
        </div>

        {/* BAÑOS */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="mb-1 font-bold text-xs text-black uppercase tracking-wide flex items-center gap-2">
              BAÑOS
              <Bath className="w-6 h-6 text-stone-500" />
            </span>
            <button
              onClick={() => {
                setBanosMin(DEFAULT_BANOS_MIN)
                setBanosMax(DEFAULT_BANOS_MAX)
                setTipoBano('cualquiera')
                setBanosError('')
              }}
              className="text-[#d97706] hover:text-gray-600 text-xs font-bold"
              title="Restablecer filtros de baños"
            >
              Reset
            </button>
          </div>

          {/* Selector de tipo de baño */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-800 mb-4">Tipo de baño:</p>
            <div className="flex gap-10">
              <label className="flex items-center gap-2 text-sm text-stone-700 font-medium cursor-pointer">
                <div className="relative inline-flex shadow-sm">
                  <input
                    type="checkbox"
                    checked={tipoBano === 'cualquiera'}
                    onChange={() => setTipoBano('cualquiera')}
                    className={`appearance-none w-[28px] h-[18px] rounded border cursor-pointer ${
                      tipoBano === 'cualquiera' ? 'bg-[#d97706] border-[#d97706]' : 'bg-white border-gray-400'
                    }`}
                  />
                  {tipoBano === 'cualquiera' && (
                    <svg
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[11px] h-[11px] pointer-events-none"
                      viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"
                    >
                      <polyline points="4 12 10 18 20 6" />
                    </svg>
                  )}
                </div>
                <span>Cualquiera</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-stone-700 font-medium cursor-pointer">
                <div className="relative inline-flex shadow-sm">
                  <input
                    type="checkbox"
                    checked={tipoBano === 'privado'}
                    onChange={() => setTipoBano('privado')}
                    className={`appearance-none w-[28px] h-[18px] rounded border cursor-pointer ${
                      tipoBano === 'privado' ? 'bg-[#d97706] border-[#d97706]' : 'bg-white border-gray-400'
                    }`}
                  />
                  {tipoBano === 'privado' && (
                    <svg
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[11px] h-[11px] pointer-events-none"
                      viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"
                    >
                      <polyline points="4 12 10 18 20 6" />
                    </svg>
                  )}
                </div>
                <span>Privado</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-stone-700 font-medium cursor-pointer">
                <div className="relative inline-flex shadow-sm">
                  <input
                    type="checkbox"
                    checked={tipoBano === 'compartido'}
                    onChange={() => setTipoBano('compartido')}
                    className={`appearance-none w-[28px] h-[18px] rounded border cursor-pointer ${
                      tipoBano === 'compartido' ? 'bg-[#d97706] border-[#d97706]' : 'bg-white border-gray-400'
                    }`}
                  />
                  {tipoBano === 'compartido' && (
                    <svg
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[11px] h-[11px] pointer-events-none"
                      viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"
                    >
                      <polyline points="4 12 10 18 20 6" />
                    </svg>
                  )}
                </div>
                <span>Compartido</span>
              </label>
            </div>
          </div>

          {/* Sliders de cantidad de baños */}
          <div className="space-y-3 pt-6 border-t border-gray-400 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-600 w-8">Mín</span>
              <input
                type="range" min={1} max={10} step={1}
                value={banosMin}
                onChange={(e) => handleBanosMinChange(Number(e.target.value))}
                className="flex-1 accent-[#d97706] h-2 rounded-lg"
              />
              <span className="text-xs text-stone-600 w-16 text-right">{banosMin}+</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-600 w-8">Máx</span>
              <input
                type="range" min={1} max={10} step={1}
                value={banosMax}
                onChange={(e) => handleBanosMaxChange(Number(e.target.value))}
                className="flex-1 accent-[#d97706] h-2 rounded-lg"
              />
              <span className="text-xs text-stone-600 w-16 text-right">{banosMax}+</span>
            </div>
            {banosError && <p className="text-xs text-red-500 mt-1">{banosError}</p>}
          </div>
        </div>
      </div>

      {/* 3. FOOTER (Fijo al fondo) */}
      <div className="shrink-0 px-6 pb-6 pt-4 border-t border-stone-100 bg-white dark:border-slate-800 dark:bg-slate-900 relative">
        
        <style dangerouslySetInnerHTML={{__html: `
          html body #btn-aplicar-capacidad {
            background-color: #d97706 !important;
            color: #ffffff !important;
          }
          html body #btn-aplicar-capacidad:hover {
            background-color: #b95e00 !important;
          }
          html.dark body #btn-aplicar-capacidad {
            background-color: #E87C1E !important;
          }
          html.dark body #btn-aplicar-capacidad:hover {
            background-color: #d97706 !important;
          }
        `}} />

        <button
          type="button"
          /* Asegúrate de dejar el onClick que ya tenías para limpiar */
          onClick={handleClear} 
          className="text-xs text-stone-400 hover:text-[#d97706] dark:text-slate-400 dark:hover:text-[#E87C1E] transition-colors underline text-center w-full mb-3"
        >
          Limpiar filtro
        </button>

        <button
          id="btn-aplicar-capacidad"
          /* Asegúrate de dejar el onClick que ya tenías para aplicar */
          onClick={handleApply} 
          className="rounded-[12px] font-bold py-3 px-4 w-full transition-all active:scale-95 shadow-md border-none"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}
