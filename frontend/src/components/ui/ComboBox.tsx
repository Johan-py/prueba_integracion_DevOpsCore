'use client'
import React, { useState, useRef, useEffect } from 'react'
import { LucideIcon, ChevronDown } from 'lucide-react'

export interface ComboBoxOption {
  label: string
  icon?: LucideIcon
}

interface ComboBoxProps {
  label: string
  placeholder?: string
  options?: (string | ComboBoxOption)[]
  icon?: LucideIcon
  value?: string
  onChange?: (value: string) => void
}

export function ComboBox({
  label,
  placeholder,
  options = [],
  icon: Icon,
  onChange
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<ComboBoxOption | null>(null)
  const comboBoxRef = useRef<HTMLDivElement>(null)

  const handleOptionClick = (option: string | ComboBoxOption) => {
    const optionObj = typeof option === 'string' ? { label: option } : option
    setSelected(optionObj)
    setIsOpen(false)

    if (onChange) {
      onChange(optionObj.label)
    }
  }

  const DisplayIcon = selected?.icon || Icon

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboBoxRef.current && !comboBoxRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`flex flex-col w-full font-inter ${label ? 'gap-2' : ''}`} ref={comboBoxRef}>
      {label && <label className="text-sm font-medium text-stone-900 dark:text-stone-200">{label}</label>}

      <div className="relative group">
        {DisplayIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
            <DisplayIcon
              className={`w-5 h-5 transition-colors ${isOpen ? 'text-[#d97706] dark:text-[#E87C1E]' : 'text-stone-400 dark:text-stone-400'}`}
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-[40px] flex items-center justify-between bg-white dark:bg-stone-800 border text-stone-600 dark:text-stone-100 pr-3 rounded-xl transition-all shadow-sm focus:outline-none focus:border-[#d97706] dark:focus:border-[#E87C1E] focus:ring-1 focus:ring-[#d97706] dark:focus:ring-[#E87C1E] hover:border-[#d97706] dark:hover:border-[#E87C1E] dark:hover:bg-stone-700 ${
            DisplayIcon ? 'pl-10' : 'pl-4'
          } ${isOpen ? 'border-[#d97706] dark:border-[#E87C1E] ring-1 ring-[#d97706] dark:ring-[#E87C1E]' : 'border-stone-200 dark:border-stone-700'}`}
        >
          <span className={`text-sm ${selected ? 'text-stone-900 dark:text-stone-100 font-medium' : 'text-stone-500 dark:text-stone-400'}`}>
            {selected?.label || placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-stone-400 dark:text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            {options.map((option) => {
              const labelText = typeof option === 'string' ? option : option.label
              const OptionIcon = typeof option === 'string' ? null : option.icon

              return (
                <li
                  key={labelText}
                  onClick={() => handleOptionClick(option)}
                  className="px-4 py-2.5 text-stone-600 dark:text-stone-300 hover:bg-[#fdf3e7] dark:hover:bg-stone-700 hover:text-[#d97706] dark:hover:text-[#E87C1E] cursor-pointer flex items-center gap-2 transition-colors text-sm"
                >
                  {OptionIcon && <OptionIcon className="w-4 h-4 opacity-70" />}
                  {labelText}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}