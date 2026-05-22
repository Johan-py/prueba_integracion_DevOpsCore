'use client'

import { useState, useEffect, useMemo, FC } from 'react'
import { SearchIcon, Menu, Home, Building, Bed, Trees, Flower2, LucideIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LocationSearch } from '../layout/LocationSearch'

interface MobileMapHeaderProps {
  onOpenMenu: () => void;
}

interface PropertyTypeOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export default function MobileMapHeader({ onOpenMenu }: MobileMapHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [modosSeleccionados, setModosSeleccionados] = useState<string[]>(['VENTA'])
  const [tipoInmuebleSeleccionado, setTipoInmuebleSeleccionado] = useState<string>('CASA')
  const [ubicacionTexto, setUbicacionTexto] = useState('')
  const [coords, setCoords] = useState<{ lat?: number, lng?: number, locationId?: number }>({})
  const [isCollapsed, setIsCollapsed] = useState(false)

  const propertyTypes: PropertyTypeOption[] = useMemo(() => [
    { id: 'CASA', label: 'Casa', icon: Home },
    { id: 'DEPARTAMENTO', label: 'Depto', icon: Building },
    { id: 'CUARTO', label: 'Cuarto', icon: Bed },
    { id: 'TERRENO', label: 'Terreno', icon: Trees },
    { id: 'TERRENO_MORTUORIO', label: 'Cementerio', icon: Flower2 }
  ], [])

  useEffect(() => {
    if (!searchParams) return
    const urlTipo = searchParams.get('tipoInmueble')
    if (urlTipo && urlTipo !== 'CUALQUIER TIPO') {
      setTipoInmuebleSeleccionado(urlTipo.toUpperCase())
    }
    const urlModos = searchParams.getAll('modoInmueble')
    if (urlModos.length > 0) setModosSeleccionados(urlModos)
    const urlQuery = searchParams.get('query')
    if (urlQuery) setUbicacionTexto(urlQuery)
  }, [searchParams])

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.delete('modoInmueble')
    params.delete('tipoInmueble')
    params.delete('query')
    params.delete('lat')
    params.delete('lng')
    
    modosSeleccionados.forEach((modo) => params.append('modoInmueble', modo))
    
    if (tipoInmuebleSeleccionado) params.set('tipoInmueble', tipoInmuebleSeleccionado)
    if (ubicacionTexto.trim() !== '') params.set('query', ubicacionTexto.trim())
    
    if (coords.lat && coords.lng) {
      params.set('lat', coords.lat.toString())
      params.set('lng', coords.lng.toString())
      params.delete('locationId')
    } else if (coords.locationId) {
      params.set('locationId', coords.locationId.toString())
    }
    
    router.push(`/busqueda_mapa${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const SectionTitle: FC<{ children: string, className?: string }> = ({ children, className = "" }) => (
    <h3 className={`text-[11px] font-bold text-stone-400 uppercase tracking-[0.15em] ${className}`}>{children}</h3>
  );

  return (
    <div className={`w-full flex flex-col relative z-[9999] transition-all duration-300 ease-in-out bg-white dark:bg-stone-950 ${isCollapsed ? 'h-[10px] border-b-0 gap-0 p-0 overflow-visible shadow-none' : 'p-4 gap-4 border-b border-stone-200 dark:border-stone-800 shadow-md'}`}>
      
      {/* BOTÓN COLAPSABLE TIPO "PULL-TAB" */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute left-1/2 -translate-x-1/2 -bottom-[28px] h-[28px] px-8 bg-white dark:bg-stone-950 border-x border-b border-stone-200 dark:border-stone-800 rounded-b-2xl shadow-md flex items-center justify-center hover:bg-stone-50 transition-all z-[10000]"
      >
        {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>

      {/* CONTENEDOR INTERNO DE FILTROS */}
      <div className={`flex w-full flex-col gap-4 transition-all duration-300 ${isCollapsed ? 'hidden' : 'flex animate-in fade-in slide-in-from-top-2'}`}>
      {/* SECCIÓN 1: Menú Hamburguesa (Absoluto) + Título Centrado (Relativo) */}
      <div className="flex items-center justify-center w-full relative min-h-[42px]">
        <button 
          onClick={onOpenMenu} 
          className="absolute left-0 p-2.5 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-700 dark:text-stone-300 active:scale-95 border border-stone-200 dark:border-stone-700 transition-colors"
        >
          <Menu size={22} />
        </button>
        <SectionTitle className="text-center">Tipo de Inmueble</SectionTitle>
      </div>

      {/* SECCIÓN 2: Iconos de Tipos de Inmueble */}
      <div className="w-full flex gap-1 justify-between overflow-x-auto no-scrollbar pb-1">
        {propertyTypes.map((type) => {
          const isSelected = tipoInmuebleSeleccionado === type.id;
          return (
            <button 
              key={type.id} 
              onClick={() => setTipoInmuebleSeleccionado(type.id)}
              className="flex flex-col items-center gap-1.5 flex-1 min-w-0 min-w-[64px]"
            >
              <div className={`p-3.5 rounded-full border transition-all active:scale-90 ${
                isSelected 
                  ? 'bg-[#d97706] text-white border-[#b95e00] shadow-md' // Naranja corregido
                  : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700'
              }`}>
                <type.icon size={20} strokeWidth={2.5} />
              </div>
              <span className={`text-[11px] font-semibold text-center truncate w-full ${isSelected ? 'text-[#d97706]' : 'text-stone-600 dark:text-stone-400'}`}>
                {type.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* SECCIÓN 3: Operación (Pills) */}
      <div className="w-full">
        <SectionTitle className="mb-2.5 text-center">Operación</SectionTitle>
        <div className="flex flex-wrap gap-2.5 justify-center">
          {[
            { id: 'VENTA', label: 'Comprar' },
            { id: 'ALQUILER', label: 'Alquiler' },
            { id: 'ANTICRETO', label: 'Anticrético' }
          ].map(mode => {
            const isSelected = modosSeleccionados.includes(mode.id);
            const toggleMode = () => {
              setModosSeleccionados(prev => prev.includes(mode.id) ? prev.filter(m => m !== mode.id) : [...prev, mode.id]);
            }
            return (
              <button 
                key={mode.id}
                onClick={toggleMode}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all border active:scale-95 ${
                  isSelected 
                    ? 'bg-[#d97706] text-white border-[#d97706] shadow-sm' // Naranja corregido
                    : 'bg-white text-[#d97706] border-[#d97706] hover:bg-amber-50 dark:bg-stone-900 dark:text-amber-500 dark:border-amber-700'
                }`}
              >
                {mode.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* SECCIÓN 4: Barra de búsqueda */}
      <div className="w-full h-[46px] mt-1">
        <div className="w-full h-full bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden [&>div]:h-full [&_input]:h-full [&_input]:bg-transparent [&_input]:border-none [&_input]:placeholder:text-stone-400 [&_.border-stone-200]:border-none [&_.dark\:border-stone-700]:border-none [&_.shadow-sm]:shadow-none">
          <LocationSearch 
            value={ubicacionTexto} 
            onChange={(val) => {
              if (typeof val === 'object') {
                setUbicacionTexto(val.nombre);
                setCoords({ lat: val.lat, lng: val.lng, locationId: val.locationId });
              } else {
                setUbicacionTexto(val);
                setCoords({});
              }
            }} 
          />
        </div>
      </div>

      {/* SECCIÓN 5: Botón BUSCAR (Separado, ancho completo y naranja exacto) */}
      <button 
        onClick={handleSearch} 
        className="w-full h-[46px] bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl shadow-md active:scale-95 flex items-center justify-center gap-2 font-bold text-[15px] transition-colors"
      >
        <SearchIcon size={18} />
        BUSCAR
      </button>

      </div>
    </div>
  )
}