'use client'


import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Check } from 'lucide-react'


export interface DropdownOption<T extends string = string> {
  label: string
  value: T
}


interface DropdownOrdenProps<T extends string = string> {
  options: DropdownOption<T>[]
  defaultValue?: T
  value?: T
  onChange: (value: T) => void
  placeholder?: string
  className?: string
}


/**
 * Componente Dropdown reutilizable para ordenamiento.
 * Props:
 * - options: Array de opciones { label, value }
 * - defaultValue: Valor inicial (opcional)
 * - value: Valor controlado (opcional)
 * - onChange: Callback cuando cambia la selección
 * - placeholder: Texto cuando no hay selección
 * - className: Clases adicionales para el contenedor
 */
export const DropdownOrden = <T extends string = string>({
  options,
  defaultValue,
  value,
  onChange,
  placeholder = 'Seleccionar',
  className = ''
}: DropdownOrdenProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue)
  const dropdownRef = useRef<HTMLDivElement>(null)


  // Usar valor controlado o interno
  const currentValue = value !== undefined ? value : internalValue


  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])


  const handleSelect = useCallback((optionValue: T) => {
    setInternalValue(optionValue)
    onChange(optionValue)
    setIsOpen(false)
  }, [onChange])


  const selectedOption = options.find((opt) => opt.value === currentValue)
  const hasSelection = selectedOption !== undefined


  return (
    <div className={`relative inline-block w-full text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`
          inline-flex w-full items-center justify-between gap-x-2
          rounded-lg px-4 py-2.5 text-sm font-medium
          border border-gray-200 bg-white
          shadow-sm transition-all duration-200
          hover:border-gray-300 hover:shadow
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1
          ${hasSelection ? 'text-gray-900' : 'text-gray-500'}
        `}
      >
        <span className="truncate">
          {hasSelection ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}
            ${hasSelection ? 'text-orange-500' : 'text-gray-400'}
          `}
          aria-hidden="true"
        />
      </button>


      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="
            absolute left-0 z-30 mt-1.5 w-full min-w-[220px]
            origin-top-left rounded-lg bg-white
            shadow-lg ring-1 ring-black/5
            animate-in fade-in-0 zoom-in-95 duration-100
          "
          role="listbox"
        >
          <div className="py-1">
            {options.map((option) => {
              const isSelected = currentValue === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={isSelected}
                  className={`
                    flex w-full items-center justify-between
                    px-4 py-2.5 text-sm text-left
                    transition-colors duration-150
                    ${isSelected
                      ? 'bg-orange-500 text-white font-semibold'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                    }
                  `}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <Check
                      className="h-4 w-4 text-white ml-2 flex-shrink-0"
                      strokeWidth={2.5}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
