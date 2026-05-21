'use client'

import { useState, useEffect } from 'react'
import { useSearchFilters } from '@/hooks/useSearchFilters'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'

interface SuperficieFilterSidebarProps {
  onClose: () => void
}

export default function SuperficieFilterSidebar({ onClose }: SuperficieFilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updateFilters } = useSearchFilters()
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [errorDesde, setErrorDesde] = useState('')
  const [errorHasta, setErrorHasta] = useState('')
  const [errorRango, setErrorRango] = useState('')

  const MAX_ENTEROS = 7
  // Cargar valores guardados
  useEffect(() => {
    const saved = sessionStorage.getItem('propbol_global_filters')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.minSuperficie) setDesde(parsed.minSuperficie)
      if (parsed.maxSuperficie) setHasta(parsed.maxSuperficie)
    }
  }, [])

  const handleKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
  campo: 'desde' | 'hasta'
) => {
  // Bloquear caracteres inválidos
  const bloqueadas = ['-', '+', 'e', 'E', ',']
  if (bloqueadas.includes(e.key)) {
    e.preventDefault()
    return
  }
  if (e.key === 'Enter') {
    e.preventDefault()
    if (!hayErrores && (desde || hasta)) handleApply()
    return
  }
  const valor = campo === 'desde' ? desde : hasta
  const setCampo = campo === 'desde' ? setDesde : setHasta
  const setError = campo === 'desde' ? setErrorDesde : setErrorHasta

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    const num = parseFloat(valor || '0') + 1
    const nuevo = (Math.round(num * 100) / 100).toString()
    setCampo(nuevo)
    setError('')
    validarRango(
      campo === 'desde' ? nuevo : desde,
      campo === 'hasta' ? nuevo : hasta
    )
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    const num = parseFloat(valor || '0') - 1
    if (num < 0) return // no negativos
    const nuevo = (Math.round(num * 100) / 100).toString()
    setCampo(nuevo)
    setError('')
    validarRango(
      campo === 'desde' ? nuevo : desde,
      campo === 'hasta' ? nuevo : hasta
    )
  }
}
  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    campo: 'desde' | 'hasta'
  ) => {
    const texto = e.clipboardData.getData('text')
    // Permitir números con hasta un punto decimal
    if (!/^\d+(\.\d*)?$/.test(texto)) {
      e.preventDefault()
      if (campo === 'desde') setErrorDesde('Valor pegado inválido')
      if (campo === 'hasta') setErrorHasta('Valor pegado inválido')
    }
  }

  // ── Validar rango lógico ──
  const validarRango = (min: string, max: string) => {
    if (min !== '' && max !== '' && Number(min) >= Number(max)) {
      setErrorRango("El valor 'Desde' debe ser menor que 'Hasta'")
    } else {
      setErrorRango('')
    }
  }
  // ── Redondear a 2 decimales al salir del campo ──
  const handleBlur = (
    valor: string,
    setCampo: (v: string) => void,
    setError: (v: string) => void
  ) => {
    if (valor === '') return
    const num = parseFloat(valor)
    if (isNaN(num)) {
      setError('Valor inválido')
      return
    }
    // Validar parte entera no supere MAX_ENTEROS dígitos
    const parteEntera = Math.floor(Math.abs(num)).toString()
    if (parteEntera.length > MAX_ENTEROS) {
      setError(`Máximo ${MAX_ENTEROS} dígitos enteros`)
      return
    }
    // Redondear a 2 decimales
    const redondeado = Math.round(num * 100) / 100
    setCampo(redondeado.toString())
    setError('')
  }
  // ── Cambio Desde ──
  const handleDesde = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    // Solo permitir dígitos y un punto decimal
    if (!/^\d*\.?\d*$/.test(val)) return
    setDesde(val)
    setErrorDesde('')
    validarRango(val, hasta)
  }
  const handleHasta = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!/^\d*\.?\d*$/.test(val)) return
    setHasta(val)
    setErrorHasta('')
    validarRango(desde, val)
  }
  const hayErrores = errorDesde !== '' || errorHasta !== '' || errorRango !== ''
  const handleApply = () => {
    if (hayErrores) return
    const nuevosFiltros = {
      minSuperficie: desde || null,
      maxSuperficie: hasta || null,
      updatedAt: new Date().toISOString(),
    }
    updateFilters(nuevosFiltros)
    const params = new URLSearchParams(searchParams.toString())
    if (desde) params.set('minSuperficie', desde)
    else params.delete('minSuperficie')
    if (hasta) params.set('maxSuperficie', hasta)
    else params.delete('maxSuperficie')
    router.push(`/busqueda_mapa?${params.toString()}`)
    onClose()
  }
  const handleLimpiar = () => {
    setDesde('') 
    setHasta('')
    setErrorDesde('')
    setErrorHasta('')
    setErrorRango('')
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-stone-900 w-full border-r border-stone-200 dark:border-stone-800">
      {/* 1. HEADER (Fijo) */}
      <div className="shrink-0 p-4 pb-2 relative flex flex-col items-center justify-center">
        <div className="w-full flex items-center justify-center relative mb-1">
          <h3 className="font-bold text-sm text-stone-800 dark:text-stone-100 uppercase tracking-wide text-center">
            Filtrar por Superficie
          </h3>
          <button
            onClick={onClose}
            className="absolute right-0 p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          >
            <X size={20} className="text-stone-500 dark:text-stone-400" />
          </button>
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-2 text-center">Ingrese el MÍN y MÁX:</p>
      </div>

      {/* 2. CONTENIDO (Con Scroll) */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
        {/* Campo Desde */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600 dark:text-stone-300 w-12">Desde:</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ej: 50"
              value={desde}
              onKeyDown={(e) => handleKeyDown(e, 'desde')}
              onPaste={(e) => handlePaste(e, 'desde')}
              onChange={handleDesde}
              onBlur={() => handleBlur(desde, setDesde, setErrorDesde)}
              className={`border rounded-lg px-3 py-2 text-sm w-full outline-none transition-all dark:bg-stone-800 dark:text-stone-200 ${
                errorDesde
                  ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-300 dark:border-red-500'
                  : 'border-stone-300 focus:border-[rgb(217,119,6)] focus:ring-1 focus:ring-[rgb(217,119,6)] dark:border-stone-600 dark:focus:border-[rgb(232,124,30)] dark:focus:ring-[rgb(232,124,30)]'
              }`}
            />
          </div>
          {errorDesde && <p className="text-xs text-red-500 ml-16">{errorDesde}</p>}
        </div>

        {/* Campo Hasta */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600 dark:text-stone-300 w-12">Hasta:</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ej: 200"
              value={hasta}
              onKeyDown={(e) => handleKeyDown(e, 'hasta')}
              onPaste={(e) => handlePaste(e, 'hasta')}
              onChange={handleHasta}
              onBlur={() => handleBlur(hasta, setHasta, setErrorHasta)}
              className={`border rounded-lg px-3 py-2 text-sm w-full outline-none transition-all dark:bg-stone-800 dark:text-stone-200 ${
                errorHasta
                  ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-300 dark:border-red-500'
                  : 'border-stone-300 focus:border-[rgb(217,119,6)] focus:ring-1 focus:ring-[rgb(217,119,6)] dark:border-stone-600 dark:focus:border-[rgb(232,124,30)] dark:focus:ring-[rgb(232,124,30)]'
              }`}
            />
          </div>
          {errorHasta && <p className="text-xs text-red-500 ml-16">{errorHasta}</p>}
        </div>

        {errorRango && (
          <p className="text-xs text-red-500 mt-3 text-center bg-red-50 dark:bg-red-500/20 py-2 px-3 rounded-lg">
            {errorRango}
          </p>
        )}
      </div>

      {/* 3. FOOTER (Fijo al fondo) */}
      <div className="shrink-0 px-6 pb-6 pt-4 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900">
        {(desde || hasta) ? (
          <button
            type="button"
            onClick={handleLimpiar}
            /* Subrayado y blanco en dark mode */
            className="text-xs text-stone-400 hover:text-[rgb(217,119,6)] transition-colors underline text-center w-full mb-3 dark:!text-white dark:hover:!text-[rgb(232,124,30)]"
          >
            Limpiar filtro
          </button>
        ) : (
          <div className="h-7 mb-3"></div> // Espaciador para mantener la altura cuando no hay botón
        )}
        <button
          type="button"
          disabled={hayErrores}
          onClick={handleApply}
          /* Hack RGB y rounded-[12px] para evadir a globals.css */
          className={`rounded-[12px] font-bold py-3 px-4 w-full transition-all active:scale-95 shadow-md border-none ${
            hayErrores
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed dark:!bg-stone-800 dark:!text-stone-500'
              : '!bg-[rgb(217,119,6)] hover:!bg-[rgb(185,94,0)] !text-white dark:!bg-[rgb(232,124,30)] dark:hover:!bg-[rgb(217,119,6)]'
          }`}
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}