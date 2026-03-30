'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { MapPin, Search, Loader2, X } from 'lucide-react'

type Location = {
  id: string | number
  nombre: string
  departamento: string
}

type LocationSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function LocationSearch({ value, onChange }: LocationSearchProps) {
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isSelected = value.includes('Bolivia')

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchLocations = async () => {
      if (value.trim().length < 2 || isSelected) {
        setSuggestions([])
        return
      }
      setIsLoading(true)
      try {
        const res = await fetch(
          `http://localhost:5000/api/locations/search?q=${encodeURIComponent(value)}`
        )
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data)
          setIsOpen(true)
        }
      } catch {
      } finally {
        setIsLoading(false)
      }
    }
    const timer = setTimeout(fetchLocations, 300)
    return () => clearTimeout(timer)
  }, [value, isSelected])

  return (
    <div className="w-full relative" ref={containerRef}>
      <label className="block text-sm font-medium text-stone-700 mb-2 text-center uppercase tracking-wide font-montserrat">
        Ciudad / Zona
      </label>

      <div
        className={`h-[46px] rounded-xl border transition-all flex items-center gap-3 px-4 bg-white shadow-sm ${
          isOpen && suggestions.length > 0
            ? 'border-amber-600 ring-2 ring-amber-100'
            : 'border-stone-300'
        }`}
      >
        <MapPin
          className={`w-5 h-5 flex-shrink-0 ${value ? 'text-amber-600' : 'text-stone-400'}`}
        />

        <div className="relative flex-1 flex items-center h-full">
          <div className="absolute inset-0 flex items-center pointer-events-none whitespace-pre text-sm font-inter">
            <span className="opacity-0">{value}</span>
            {isSelected && (
              <Image
                src="https://flagcdn.com/w20/bo.png"
                alt="BO"
                width={20}
                height={14}
                className="ml-2 rounded-sm flex-shrink-0 mb-[1px]"
              />
            )}
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Cochabamba, La Paz..."
            className="w-full bg-transparent outline-none text-sm text-stone-900 placeholder:text-stone-400 font-inter relative z-10"
          />
        </div>

        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
        ) : (
          value && (
            <button onClick={() => onChange('')} type="button">
              <X className="w-4 h-4 text-stone-400 hover:text-red-500" />
            </button>
          )
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden">
          {suggestions.map((loc) => (
            <button
              key={loc.id}
              type="button"
              onClick={() => {
                onChange(`${loc.nombre} - ${loc.departamento} - Bolivia`)
                setIsOpen(false)
              }}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-50 transition-colors text-left border-b border-stone-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Search className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-sm font-bold text-stone-500">
                  {loc.nombre} - {loc.departamento}
                </span>
              </div>
              <Image
                src="https://flagcdn.com/w20/bo.png"
                alt="BO"
                width={20}
                height={14}
                className="rounded-sm"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
