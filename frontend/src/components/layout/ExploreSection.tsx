'use client'

import { useState } from 'react'
import { ComboBox } from '../ui/ComboBox'
import { Home, Search, Building, Bed, Trees, Flower2 } from 'lucide-react'
import { LocationSearch } from './LocationSearch'

const searchOptions = [
  { id: 'venta', name: 'Venta' },
  { id: 'alquiler', name: 'Alquiler' },
  { id: 'anticretico', name: 'Anticrético' }
]

export default function ExploreSection() {
  const [selectedOption, setSelectedOption] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const propertyTypes = [
    { label: 'Casas', icon: Home },
    { label: 'Departamentos', icon: Building },
    { label: 'Cuartos', icon: Bed },
    { label: 'Terrenos', icon: Trees },
    { label: 'Espacios Cementerio', icon: Flower2 }
  ]

  const handleSearch = () => {
    const hasOperationFilter = selectedOption.length > 0
    const hasLocationFilter = location.trim().length > 0

    if (!hasOperationFilter && !hasLocationFilter) {
      setErrorMessage('Selecciona al menos un filtro para buscar.')
      return
    }

    setErrorMessage('')
  }

  return (
    <section className="bg-white py-10 md:py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="rounded-2xl bg-white p-6 shadow-xl border border-stone-100 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {searchOptions.map((option) => {
              const isSelected = selectedOption.includes(option.id)
              return (
                <button
                  key={option.id}
                  onClick={() =>
                    setSelectedOption((prev) =>
                      prev.includes(option.id)
                        ? prev.filter((item) => item !== option.id)
                        : [...prev, option.id]
                    )
                  }
                  className="flex items-center gap-2.5 transition-colors duration-200 group focus:outline-none"
                >
                  <div
                    className={`w-7 h-7 rounded-md border shadow-sm flex items-center justify-center transition-all ${
                      isSelected ? 'bg-amber-500 border-amber-500' : 'bg-white border-stone-300'
                    }`}
                  >
                    {isSelected && <span className="text-white text-sm font-bold">✓</span>}
                  </div>
                  <span
                    className={`font-semibold font-montserrat text-lg transition-colors ${
                      isSelected ? 'text-amber-700' : 'text-stone-900 group-hover:text-amber-600'
                    }`}
                  >
                    {option.name}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-col md:flex-row items-end justify-between gap-4 w-full">
            <div className="w-full md:w-1/3">
              <ComboBox
                label="Tipo de Inmueble"
                placeholder="Cualquier tipo"
                options={propertyTypes}
                icon={Home}
              />
            </div>
            <div className="w-full">
              <LocationSearch
                value={location}
                onChange={(value) => {
                  setLocation(value)
                  if (errorMessage) setErrorMessage('')
                }}
              />
            </div>
            <button
              onClick={handleSearch}
              className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-10 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md h-[46px] mb-[1px] shrink-0"
            >
              <Search className="w-5 h-5" />
              BUSCAR
            </button>
          </div>
          {errorMessage && <p className="text-sm text-red-500 font-medium">{errorMessage}</p>}
        </div>
      </div>
    </section>
  )
}
