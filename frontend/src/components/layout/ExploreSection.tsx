'use client'

import { useState } from 'react'
import { ComboBox } from '../ui/ComboBox'
import { Home, Search, Building, Bed, Trees, Flower2 } from 'lucide-react'
import { LocationSearch } from './LocationSearch'
import { useRouter } from 'next/navigation'
import { useSearchFilters } from '@/hooks/useSearchFilters'

const searchOptions = [
  { id: 'venta', name: 'Venta' },
  { id: 'alquiler', name: 'Alquiler' },
  { id: 'anticreto', name: 'Anticrético' }
]

// 🚀 1. Definimos el tipo para saber qué nos manda el autocompletado
type LocationValue = string | { nombre: string; lat?: number; lng?: number }

export default function ExploreSection() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [propertyType, setPropertyType] = useState('Cualquier tipo')
  const [errorMessage, setErrorMessage] = useState('')

  // 🚀 2. Estado para guardar las coordenadas temporalmente
  const [coords, setCoords] = useState<{ lat?: number, lng?: number }>({})

  const propertyTypes = [
    { label: 'Casas', icon: Home },
    { label: 'Departamentos', icon: Building },
    { label: 'Cuartos', icon: Bed },
    { label: 'Terrenos', icon: Trees },
    { label: 'Espacios Cementerio', icon: Flower2 }
  ]

  const { updateFilters } = useSearchFilters()

  // 🚀 3. El Helper Estricto (Igual que en FilterBar)
  const handleLocationChange = (val: LocationValue) => {
    if (typeof val === 'object' && val !== null) {
      setLocation(val.nombre) // Guardamos solo el String en el input
      setCoords({ lat: val.lat, lng: val.lng }) // Guardamos las coordenadas en secreto
    } else {
      setLocation(val as string)
      setCoords({})
    }
    if (errorMessage) setErrorMessage('')
  }

  const handleSearch = () => {
    // 🚀 4. location ahora siempre será un string seguro, ya no explotará el .trim()
    const hasOperationFilter = selectedOption.length > 0
    const hasLocationFilter = location.trim().length > 0

    if (!hasOperationFilter && !hasLocationFilter) {
      setErrorMessage('Selecciona al menos un filtro para buscar.')
      return
    }

    setErrorMessage('')

    const tipoMap: Record<string, string> = {
      Casas: 'CASA',
      Departamentos: 'DEPARTAMENTO',
      Cuartos: 'CUARTO',
      Terrenos: 'TERRENO',
      'Espacios Cementerio': 'TERRENO'
    }
    const tipoFinal =
      tipoMap[propertyType] || (propertyType !== 'Cualquier tipo' ? propertyType.toUpperCase() : '')

    const modoMapeado = selectedOption.map((m) => {
      if (m === 'anticreto') return 'ANTICRETO'
      return m.toUpperCase()
    })

    updateFilters({
      tipoInmueble: tipoFinal ? [tipoFinal] : [],
      modoInmueble: modoMapeado,
      query: location.trim()
    })

    const params = new URLSearchParams()
    try {
      const merged = JSON.parse(sessionStorage.getItem('propbol_global_filters') || '{}') as {
        locationId?: string | number
      }
      if (merged.locationId != null && merged.locationId !== '') {
        params.set('locationId', String(merged.locationId))
      }
    } catch {
      /* ignore */
    }
    modoMapeado.forEach((modo) => params.append('modoInmueble', modo))
    if (tipoFinal) params.set('tipoInmueble', tipoFinal)
    if (location.trim() !== '') params.set('query', location.trim())

    // 🚀 5. Inyectamos la magia de Mapbox a la URL si existen las coordenadas
    if (coords.lat && coords.lng) {
      params.set('lat', coords.lat.toString())
      params.set('lng', coords.lng.toString())
      params.set('radius', '1') // Radio de 1km por defecto
    }

    const finalUrl = `/busqueda_mapa?${params.toString()}`
    console.log('🚀 Navegando desde Home a:', finalUrl)
    router.push(finalUrl)
  }

  return (
    <section className="bg-white py-4 md:py-6 w-full">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* MOBILE */}
        <div className="md:hidden">
          <div id="tour-buscador-mobile" className="rounded-2xl bg-white p-4 shadow-xl border border-stone-100 flex flex-col gap-4">
            <ComboBox
              label="Operación"
              placeholder="Selecciona"
              options={searchOptions.map((opt) => ({
                label: opt.name,
                value: opt.id
              }))}
              icon={Search}
              onChange={(val) => setSelectedOption([val])}
            />

            <ComboBox
              label="Tipo de Inmueble"
              placeholder="Cualquier tipo"
              options={propertyTypes}
              icon={Home}
              onChange={(val) => setPropertyType(val)}
            />

            {/* 🚀 6. Aplicamos el helper al Mobile */}
            <LocationSearch
              value={location}
              onChange={handleLocationChange}
            />

            <button
              onClick={handleSearch}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              BUSCAR
            </button>

            {errorMessage && <p className="text-sm text-red-500 font-medium">{errorMessage}</p>}
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:block">
          <div id="tour-buscador" className="rounded-2xl bg-white p-6 shadow-xl border border-stone-100 flex flex-col gap-6">
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
                      className={`w-7 h-7 rounded-md border shadow-sm flex items-center justify-center transition-all ${isSelected ? 'bg-amber-500 border-amber-500' : 'bg-white border-stone-300'
                        }`}
                    >
                      {isSelected && <span className="text-white text-sm font-bold">✓</span>}
                    </div>
                    <span
                      className={`font-semibold font-montserrat text-lg transition-colors ${isSelected ? 'text-amber-700' : 'text-stone-900 group-hover:text-amber-600'
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
                  onChange={(val) => setPropertyType(val)}
                />
              </div>

              <div className="w-full">
                {/* 🚀 7. Aplicamos el helper al Desktop */}
                <LocationSearch
                  value={location}
                  onChange={handleLocationChange}
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
      </div>
    </section>
  )
}