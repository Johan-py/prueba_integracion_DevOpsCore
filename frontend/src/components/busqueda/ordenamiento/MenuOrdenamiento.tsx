'use client'


import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ArrowUpDown } from 'lucide-react'
import {
  EstadoOrdenamiento,
  OrdenFecha,
  OrdenDireccion,
  OPCIONES_FECHA,
  OPCIONES_DIRECCION,
  ORDENAMIENTO_DEFAULT
} from '../../../types/inmueble'


// ─── Types ────────────────────────────────────────────────────────────────────


interface MenuOrdenamientoProps {
  ordenActual?: EstadoOrdenamiento
  onOrdenChange?: (orden: EstadoOrdenamiento) => void
  totalResultados: number
}


interface DropdownProps {
  label: string
  isOpen: boolean
  onToggle: () => void
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
}


// ─── Dropdown Base ────────────────────────────────────────────────────────────


function Dropdown({ label, isOpen, onToggle, children }: DropdownProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700
                   bg-white border border-gray-200 rounded-lg shadow-sm
                   hover:border-orange-300 hover:text-orange-500
                   transition-colors duration-150"
      >
        {label}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>


      {isOpen && (
        <div
          className="absolute left-0 top-full mt-1.5 z-50 bg-white rounded-lg shadow-lg
                        border border-gray-100 min-w-[200px] py-1
                        animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {children}
        </div>
      )}
    </div>
  )
}


// ─── Dropdown Item ────────────────────────────────────────────────────────────


function DropdownItem({ label, isSelected, onClick }: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150
        ${
          isSelected
            ? 'bg-orange-500 text-white font-semibold'
            : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
        }`}
    >
      {label}
    </button>
  )
}


// ─── Sección de Métrica (Precio/Superficie) ───────────────────────────────────


function SeccionMetrica({ titulo, valor, onChange }: SeccionMetricaProps) {
  return (
    <div className="px-3 py-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{titulo}</p>
      <div className="space-y-0.5">
        {OPCIONES_DIRECCION.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`w-full text-left text-sm py-1.5 px-2 rounded transition-colors duration-150
              ${
                valor === opt.value
                  ? 'text-orange-500 font-semibold bg-orange-50'
                  : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}


// ─── Menu Principal de Ordenamiento ───────────────────────────────────────────


export function MenuOrdenamiento({
  ordenActual = ORDENAMIENTO_DEFAULT,
  onOrdenChange,
  totalResultados
}: MenuOrdenamientoProps) {
  const [orden, setOrden] = useState<EstadoOrdenamiento>(ordenActual)
  const [dropdownAbierto, setDropdownAbierto] = useState<'fecha' | 'metricas' | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)


  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownAbierto(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  // Toggle dropdown
  function toggleDropdown(dropdown: 'fecha' | 'metricas') {
    setDropdownAbierto((prev) => (prev === dropdown ? null : dropdown))
  }


  // Actualizar estado de ordenamiento
  function actualizarOrden(parcial: Partial<EstadoOrdenamiento>) {
    const nuevoOrden: EstadoOrdenamiento = { ...orden, ...parcial }
    setOrden(nuevoOrden)
    onOrdenChange?.(nuevoOrden)
  }


  // Labels activos
  const labelFechaActivo =
    OPCIONES_FECHA.find((o) => o.value === orden.fecha)?.label ?? 'Más recientes'


  const labelPrecioActivo =
    OPCIONES_DIRECCION.find((o) => o.value === orden.precio)?.label ?? 'Menor a Mayor'


  const labelSuperficieActivo =
    OPCIONES_DIRECCION.find((o) => o.value === orden.superficie)?.label ?? 'Menor a Mayor'


  return (
    <div ref={menuRef} className="flex flex-col gap-4 mb-6">
      {/* Encabezado con contador */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          <span className="text-orange-500">{totalResultados}</span>
          <span className="ml-1.5 text-gray-600 font-normal">
            {totalResultados === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
          </span>
        </h2>
      </div>


      {/* Sección de ordenamiento */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
          <span className="text-sm font-semibold text-gray-600">Ordenar por:</span>
        </div>


        <div className="flex flex-wrap gap-4">
          {/* Dropdown Fecha */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-400 font-medium">Fecha:</span>
            <Dropdown
              label={labelFechaActivo}
              isOpen={dropdownAbierto === 'fecha'}
              onToggle={() => toggleDropdown('fecha')}
            >
              {OPCIONES_FECHA.map((opt) => (
                <DropdownItem
                  key={opt.value}
                  label={opt.label}
                  isSelected={orden.fecha === opt.value}
                  onClick={() => {
                    actualizarOrden({ fecha: opt.value })
                    setDropdownAbierto(null)
                  }}
                />
              ))}
            </Dropdown>
          </div>


          {/* Dropdown Métricas (Precio + Superficie) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-400 font-medium">Métricas:</span>
            <Dropdown
              label={`Precio: ${labelPrecioActivo}`}
              isOpen={dropdownAbierto === 'metricas'}
              onToggle={() => toggleDropdown('metricas')}
            >
              <SeccionMetrica
                titulo="Precio"
                valor={orden.precio}
                onChange={(val) => actualizarOrden({ precio: val })}
              />
              <div className="border-t border-gray-100 my-1" />
              <SeccionMetrica
                titulo="Superficie"
                valor={orden.superficie}
                onChange={(val) => actualizarOrden({ superficie: val })}
              />
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  )
}
