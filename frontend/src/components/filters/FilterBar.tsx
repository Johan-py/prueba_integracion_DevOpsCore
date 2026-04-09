'use client'

import { useEffect, useState } from 'react'
import { Home, Search as SearchIcon } from 'lucide-react'
import { useSearchFilters } from '@/hooks/useSearchFilters'
import { LocationSearch } from '../layout/LocationSearch'
import { ComboBox } from '../ui/ComboBox'
import TransactionModeFilter from './TransactionModeFilter'
import { useRouter } from 'next/navigation'

interface FilterBarProps {
  onSearch?: (filtros: {
    tipoInmueble: string[]
    modoInmueble: string[]
    query: string
    updatedAt: string
  }) => void
  variant?: 'home' | 'map'
}

type LocationValue = string | { nombre?: string; target?: { value?: string } }

export default function FilterBar({ onSearch, variant = 'home' }: FilterBarProps) {
  const router = useRouter()
  const { updateFilters } = useSearchFilters()
  const [modosSeleccionados, setModosSeleccionados] = useState<string[]>(['VENTA'])
  const [tipoInmueble, setTipoInmueble] = useState<string>('Cualquier tipo')
  const [ubicacionTexto, setUbicacionTexto] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('propbol_global_filters')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.tipoInmueble) setTipoInmueble(parsed.tipoInmueble[0] || 'Cualquier tipo')
      if (parsed.modoInmueble) {
        setModosSeleccionados(
          Array.isArray(parsed.modoInmueble) ? parsed.modoInmueble : [parsed.modoInmueble]
        )
      }
      if (parsed.query) setUbicacionTexto(parsed.query)
    }
  }, [])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const tipoMap: Record<string, string> = {
      Casa: 'CASA',
      Departamento: 'DEPARTAMENTO',
      Terreno: 'TERRENO',
      Cuarto: 'CUARTO',
      Espacios: 'ESPACIOS',
      Cementerio: 'CEMENTERIO'
    }
    const tipoFinal =
      tipoMap[tipoInmueble] ||
      (tipoInmueble !== 'Cualquier tipo' ? tipoInmueble.toUpperCase() : null)

    const nuevosFiltros = {
      tipoInmueble: tipoInmueble !== 'Cualquier tipo' ? [tipoInmueble.toUpperCase()] : [],
      modoInmueble: modosSeleccionados,
      query: ubicacionTexto,
      updatedAt: new Date().toISOString()
    }

    updateFilters(nuevosFiltros)
    const params = new URLSearchParams()
    modosSeleccionados.forEach((modo) => params.append('modoInmueble', modo))
    if (tipoFinal) params.set('tipoInmueble', tipoFinal)
    if (ubicacionTexto.trim() !== '') params.set('query', ubicacionTexto.trim())

    const targetUrl = `/busqueda_mapa${params.toString() ? `?${params.toString()}` : ''}`
    router.push(targetUrl)
    if (onSearch) onSearch(nuevosFiltros)
  }

  // Estilos de contenedor principal
  const containerStyles =
    variant === 'map'
      ? 'bg-white border-b border-stone-200 p-3 flex flex-col md:flex-row items-center gap-4 w-full shadow-sm'
      : 'bg-white shadow-lg rounded-[30px] p-6 flex flex-col gap-6 w-full max-w-[921px]'

  return (
    <form className={containerStyles} onSubmit={handleSearch}>
      {/* 🔹 Modo venta/alquiler - Centrado verticalmente respecto a los inputs */}
      <div className="w-full md:w-auto self-center md:self-end md:mb-2.5">
        <TransactionModeFilter
          modoSeleccionado={modosSeleccionados}
          onModoChange={setModosSeleccionados}
        />
      </div>

      {/* 🔹 CONTENIDO PRINCIPAL - Usamos items-end para alinear las bases de los inputs y el botón */}
      <div className="flex flex-col md:flex-row w-full gap-3 items-stretch md:items-end">
        {/* 🔸 Tipo */}
        <div className="w-full md:w-48">
          <ComboBox
            label={variant === 'map' ? '' : 'Tipo'}
            placeholder="Cualquier tipo"
            icon={Home}
            options={['Casa', 'Departamento', 'Terreno', 'Cuarto', 'Espacios', 'Cementerio']}
            onChange={(val: string) => setTipoInmueble(val)}
          />
        </div>

        {/* 🔸 Ubicación - El LocationSearch suele tener un label arriba, items-end lo nivelará */}
        <div className="w-full flex-1">
          <LocationSearch
            value={ubicacionTexto}
            onChange={(val: LocationValue) => {
              const text = typeof val === 'string' ? val : val?.nombre || val?.target?.value || ''
              setUbicacionTexto(text)
            }}
          />
        </div>

        {/* 🔸 Botón - Ajustado para machear la altura de los inputs (aprox 46-48px) */}
        <div className="w-full md:w-auto">
          <button
            type="submit"
            className={`w-full md:w-auto h-[46px] px-5 bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${variant === 'map' ? 'aspect-square md:aspect-auto' : ''}`}
          >
            <SearchIcon size={20} />
            {variant === 'home' && <span>BUSCAR</span>}
          </button>
        </div>
      </div>
    </form>
  )
}
