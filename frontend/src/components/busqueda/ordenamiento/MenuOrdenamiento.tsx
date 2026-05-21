'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ArrowUpDown } from 'lucide-react'
import {
  EstadoOrdenamiento,
  CriterioActivo,
  OrdenDireccion,
  OPCIONES_FECHA,
  OPCIONES_DIRECCION,
  ORDENAMIENTO_DEFAULT
} from '../../../types/inmueble'

interface MenuOrdenamientoProps {
  ordenActual?: EstadoOrdenamiento
  onOrdenChange?: (orden: EstadoOrdenamiento) => void
  totalResultados: number
  isCompact?: boolean
  /** Panel lateral mapa: sin márgenes inferiores que generen hueco; compacta espaciado */
  embeddedInPanel?: boolean
}

interface DropdownProps {
  label: string
  isOpen: boolean
  onToggle: () => void
  disabled?: boolean
  children: React.ReactNode
}

interface DropdownItemProps {
  label: string
  isSelected: boolean
  onClick: () => void
}

interface SeccionMetricaProps {
  titulo: string
  valor: OrdenDireccion
  onChange: (val: OrdenDireccion) => void
  isActive: boolean
}

function Dropdown({ label, isOpen, onToggle, disabled = false, children }: DropdownProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-normal
          border rounded-lg shadow-sm transition-colors duration-150 w-[120px] truncate
          ${
            disabled
              ? 'bg-gray-50 dark:bg-stone-800 border-gray-100 dark:border-stone-700 text-gray-300 dark:text-stone-500 cursor-not-allowed opacity-60'
              : 'bg-white dark:bg-stone-800 border-gray-200 dark:border-stone-700 text-gray-700 dark:text-stone-300 hover:border-orange-300 hover:text-orange-500 dark:hover:border-orange-500 dark:hover:text-orange-400'
          }`}
      >
        {label}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && !disabled && (
        <div
          className="absolute left-0 top-full mt-1.5 z-50 bg-white dark:bg-stone-800 rounded-lg shadow-lg
                     border border-gray-100 dark:border-stone-700 min-w-[120px] py-1
                     animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {children}
        </div>
      )}
    </div>
  )
}

function DropdownItem({ label, isSelected, onClick }: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 text-xs transition-colors duration-150
        ${
          isSelected
            ? 'bg-orange-500 text-white font-medium'
            : 'text-gray-700 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-stone-700 hover:text-orange-500 dark:hover:text-orange-400'
        }`}
    >
      {label}
    </button>
  )
}

function SeccionMetrica({ titulo, valor, onChange, isActive }: SeccionMetricaProps) {
  return (
    <div className="px-3 py-2">
      <p
        className={`text-xs font-medium uppercase tracking-wide mb-1.5
        ${isActive ? 'text-gray-400 dark:text-stone-400' : 'text-gray-300 dark:text-stone-600'}`}
      >
        {titulo}
      </p>
      <div className="space-y-0.5">
        {OPCIONES_DIRECCION.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`w-full text-left text-xs py-1.5 px-2 rounded transition-colors duration-150 whitespace-nowrap
              ${
                isActive && valor === opt.value
                  ? 'text-orange-500 font-medium bg-orange-50 dark:bg-stone-700'
                  : isActive
                    ? 'text-gray-700 dark:text-stone-300 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-stone-700'
                    : 'text-gray-300 dark:text-stone-600 hover:text-orange-400 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-stone-700'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function MenuOrdenamiento({
  ordenActual = ORDENAMIENTO_DEFAULT,
  onOrdenChange,
  totalResultados,
  isCompact = false,
  embeddedInPanel = false
}: MenuOrdenamientoProps) {
  const [orden, setOrden] = useState<EstadoOrdenamiento>(ordenActual)
  const [dropdownAbierto, setDropdownAbierto] = useState<'fecha' | 'metricas' | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const procesandoRef = useRef(false)

  // criterioActivo viene DENTRO de orden ahora — es la fuente de verdad única
  const criterioActivo: CriterioActivo = orden.criterioActivo

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownAbierto(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggleDropdown(dropdown: 'fecha' | 'metricas') {
    setDropdownAbierto((prev) => (prev === dropdown ? null : dropdown))
  }

  function aplicar(parcial: Partial<EstadoOrdenamiento>) {
    if (procesandoRef.current) return
    procesandoRef.current = true

    const nuevoOrden: EstadoOrdenamiento = { ...orden, ...parcial }
    setOrden(nuevoOrden)
    onOrdenChange?.(nuevoOrden)

    setTimeout(() => {
      procesandoRef.current = false
    }, 300)
  }

  // ── Seleccionar FECHA ──────────────────────────────────────────────────────
  function seleccionarFecha(valor: EstadoOrdenamiento['fecha']) {
    aplicar({
      fecha: valor,
      precio: ORDENAMIENTO_DEFAULT.precio,
      superficie: ORDENAMIENTO_DEFAULT.superficie,
      criterioActivo: valor === 'mas-recomendados' ? 'recomendados' : 'fecha'
    })
    setDropdownAbierto(null)
  }

  // ── Seleccionar PRECIO ─────────────────────────────────────────────────────
  function seleccionarPrecio(valor: OrdenDireccion) {
    aplicar({
      fecha: ORDENAMIENTO_DEFAULT.fecha,
      precio: valor,
      superficie: ORDENAMIENTO_DEFAULT.superficie,
      criterioActivo: 'precio'
    })
  }

  // ── Seleccionar SUPERFICIE ─────────────────────────────────────────────────
  function seleccionarSuperficie(valor: OrdenDireccion) {
    aplicar({
      fecha: ORDENAMIENTO_DEFAULT.fecha,
      precio: ORDENAMIENTO_DEFAULT.precio,
      superficie: valor,
      criterioActivo: 'superficie'
    })
  }

  // ── Labels dinámicos ───────────────────────────────────────────────────────
  const labelFecha = OPCIONES_FECHA.find((o) => o.value === orden.fecha)?.label ?? 'Más recientes'

  const labelMetricas = (() => {
    if (criterioActivo === 'precio')
      return OPCIONES_DIRECCION.find((o) => o.value === orden.precio)?.label ?? 'Precio'
    if (criterioActivo === 'superficie')
      return OPCIONES_DIRECCION.find((o) => o.value === orden.superficie)?.label ?? 'Superficie'
    return 'Métricas'
  })()

  // ── Opacidad según criterio activo ────────────────────────────────────────
  const fechaApagada = criterioActivo === 'precio' || criterioActivo === 'superficie'
  const metricasApagada = criterioActivo === 'fecha'

  const panelClasses = embeddedInPanel
    ? `${isCompact ? 'gap-1 mb-0' : 'gap-2 mb-0'}`
    : `${isCompact ? 'gap-2 mb-0' : 'gap-4 mb-6'}`

  return (
    <div
      ref={menuRef}
      className={`flex w-fit max-w-full flex-col transition-all duration-300 ${panelClasses}`}
    >
      {/* Contenedor principal animado */}
      <div
        className={`flex flex-col transition-all duration-300 ${isCompact ? 'gap-0' : embeddedInPanel ? 'gap-2' : 'gap-3'}`}
      >
        {/* Título: Ordenar por (Se oculta al hacer scroll) */}
        <div
          className={`flex items-center gap-1.5 min-w-max transition-all duration-300 overflow-hidden ${isCompact ? 'max-h-0 opacity-0 m-0' : 'max-h-10 opacity-100'}`}
        >
          <ArrowUpDown className="w-4 h-4 text-gray-400 dark:text-stone-400" strokeWidth={2} />
          <span className="text-sm font-semibold text-gray-600 dark:text-stone-300">Ordenar por:</span>
        </div>

        <div className="flex flex-row flex-wrap gap-3 items-end">
          {/* Dropdown Fecha */}
          <div
            className={`flex flex-col transition-all duration-200 ${fechaApagada ? 'opacity-40 pointer-events-none' : ''} ${isCompact ? 'gap-0' : 'gap-1.5'}`}
          >
            <div
              className={`transition-all duration-300 overflow-hidden ${isCompact ? 'max-h-0 opacity-0' : 'max-h-6 opacity-100'}`}
            >
              <span className="text-xs text-gray-400 dark:text-stone-400 font-medium">Más:</span>
            </div>
            <Dropdown
              label={labelFecha}
              isOpen={dropdownAbierto === 'fecha'}
              onToggle={() => toggleDropdown('fecha')}
              disabled={fechaApagada}
            >
              {OPCIONES_FECHA.map((opt) => (
                <DropdownItem
                  key={opt.value}
                  label={opt.label}
                  isSelected={criterioActivo === 'fecha' && orden.fecha === opt.value}
                  onClick={() => seleccionarFecha(opt.value)}
                />
              ))}
            </Dropdown>
          </div>

          {/* Dropdown Métricas */}
          <div
            className={`flex flex-col transition-all duration-200 ${metricasApagada ? 'opacity-40 pointer-events-none' : ''} ${isCompact ? 'gap-0' : 'gap-1.5'}`}
          >
            <div
              className={`transition-all duration-300 overflow-hidden ${isCompact ? 'max-h-0 opacity-0' : 'max-h-6 opacity-100'}`}
            >
              <span className="text-xs text-gray-400 dark:text-stone-400 font-medium">Métricas:</span>
            </div>
            <Dropdown
              label={labelMetricas}
              isOpen={dropdownAbierto === 'metricas'}
              onToggle={() => toggleDropdown('metricas')}
              disabled={metricasApagada}
            >
              <SeccionMetrica
                titulo="Precio"
                valor={orden.precio}
                onChange={seleccionarPrecio}
                isActive={criterioActivo !== 'superficie'}
              />
              <div className="px-3 py-1">
                <div className="border-t border-gray-100 dark:border-stone-700 my-1" />
              </div>
              <SeccionMetrica
                titulo="Superficie"
                valor={orden.superficie}
                onChange={seleccionarSuperficie}
                isActive={criterioActivo !== 'precio'}
              />
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Limpiar solo visible si hay criterio activo (Se oculta al hacer scroll) */}
      {criterioActivo !== null && (
        <button
          type="button"
          onClick={() => {
            aplicar(ORDENAMIENTO_DEFAULT)
            setDropdownAbierto(null)
          }}
          className={`self-start text-xs text-gray-400 dark:text-stone-500 hover:text-orange-500 dark:hover:text-orange-400 underline underline-offset-2 transition-all duration-300 overflow-hidden ${isCompact ? 'max-h-0 opacity-0 m-0' : 'max-h-6 opacity-100'}`}
        >
          Limpiar ordenamiento
        </button>
      )}
    </div>
  )
}
