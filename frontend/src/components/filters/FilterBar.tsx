'use client'
import { OfertaButton } from '../busqueda/ofertas/OfertaButton'
import { useEffect, useMemo, useState } from 'react'
import { CapacidadButton } from '../busqueda/capacidad/CapacidadButton'
import {
  Home,
  Search as SearchIcon,
  DollarSign,
  Users,
  Maximize,
  Award,
  SlidersHorizontal,
  ChevronDown,
  Building,
  Bed,
  Trees,
  Flower2,
  MapPin,
  X,
  Tag
} from 'lucide-react'
import { useSearchFilters } from '@/hooks/useSearchFilters'
import { LocationSearch } from '../layout/LocationSearch'
import { ComboBox } from '../ui/ComboBox'
import TransactionModeFilter from './TransactionModeFilter'
import { useRouter, useSearchParams } from 'next/navigation'
import { UbicacionEspecificaPanel } from './UbicacionEspecificaPanel';
import SuperficieFilter from './SuperficieFilter'
import AdvancedFiltersModal from './AdvancedFiltersModal'
import { useCompareStore } from '@/hooks/useCompareStore'
import { BarChart2 } from 'lucide-react'

// --- DICCIONARIOS PARA MAPEAR IDs A NOMBRES ---
const AMENITIES_MAP: Record<string, string> = {
  '1': 'Piscina', '2': 'Terraza', '3': 'Jardín', '4': 'Cochera', '5': 'Gimnasio',
  '6': 'Ascensor', '7': 'Aire', '8': 'Amueblado', '9': 'Parrillero', '10': 'Seguridad'
}

interface FilterBarProps {
  onSearch?: (filtros: {
    tipoInmueble: string[]
    modoInmueble: string[]
    query: string
    updatedAt: string
  }) => void
  variant?: 'home' | 'map'
  onOpenPriceFilter?: () => void
  onOpenSuperficieFilter?: () => void
  isCapacidadActive?: boolean
  onToggleCapacidad?: () => void
  isPriceFilterActive?: boolean
  isSuperficieFilterActive?: boolean
  isZonaFilterActive?: boolean
  isOfertaActive?: boolean
  onToggleOferta?: () => void
  isEtiquetasFilterActive?: boolean
  onOpenEtiquetasFilter?: () => void
}
type LocationValue =
  | string
  | {
    nombre: string
    lat?: number
    lng?: number
    locationId?: number
  }

// Botón Mock
const MockFilterChip = ({
  icon: Icon,
  text,
  hasChevron = true,
  onClick
}: {
  icon?: any
  text: string
  hasChevron?: boolean
  onClick?: () => void
}) => (
  <button
    type="button"
    className="h-[40px] flex items-center gap-2 px-4 rounded-full bg-white border border-stone-200 text-stone-600 text-sm font-medium hover:border-[#d97706] shadow-sm transition-all focus:outline-none shrink-0"
  >
    {Icon && <Icon className="w-4 h-4 text-stone-500" />}
    <span>{text}</span>
    {hasChevron && <ChevronDown className="w-4 h-4 text-stone-400" />}
  </button>
)
const trackSearchTelemetria = async (filtros: {
  tipoInmueble: string[]
  modoInmueble: string[]
  query: string
  zona?: string
  precioMin?: string | null
  precioMax?: string | null
  superficieMin?: string | null
  superficieMax?: string | null
  dormitoriosMin?: string | null
  dormitoriosMax?: string | null
  banosMin?: string | null
  banosMax?: string | null
  banoCompartido?: boolean | null
}) => {
  try {
    await fetch('/api/telemetria/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...filtros,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.pathname : ''
      })
    })
  } catch (error) {
    console.error('Error tracking search:', error)
  }
}

export default function FilterBar({ onSearch, variant = 'home', onOpenPriceFilter, onOpenSuperficieFilter, isCapacidadActive = false, onToggleCapacidad, isPriceFilterActive = false, isSuperficieFilterActive = false, isZonaFilterActive = false, isOfertaActive = false, onToggleOferta, isEtiquetasFilterActive = false, onOpenEtiquetasFilter }: FilterBarProps) {

  const router = useRouter()
  const searchParams = useSearchParams()
  const { updateFilters } = useSearchFilters()
  const [modosSeleccionados, setModosSeleccionados] = useState<string[]>(['VENTA'])
  const [tipoInmueble, setTipoInmueble] = useState<string>('Cualquier tipo')
  const [ubicacionTexto, setUbicacionTexto] = useState('')
  const [isZonaOpen, setIsZonaOpen] = useState(false)
  const { isCompareMode, toggleCompareMode, selectedIds } = useCompareStore()

  //Estado para almacenar las coordenadas temporalmente
  const [coords, setCoords] = useState<{ lat?: number, lng?: number }>({})
  //HU6
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)

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

  const propertyTypes = useMemo(() => [
    { label: 'Casas', icon: Home },
    { label: 'Departamentos', icon: Building },
    { label: 'Cuartos', icon: Bed },
    { label: 'Terrenos', icon: Trees },
    { label: 'Espacios Cementerio', icon: Flower2 }
  ], [])

  // NUEVO: Sincronización reactiva desde la URL (Query Params)
  useEffect(() => {
    if (!searchParams) return

    // Restaurar Tipo de Inmueble
    const urlTipo = searchParams.get('tipoInmueble')
    if (urlTipo && urlTipo !== 'CUALQUIER TIPO') {
      const match = propertyTypes.find(pt => pt.label.toUpperCase() === urlTipo.toUpperCase())
      if (match) setTipoInmueble(match.label)
    } else {
      setTipoInmueble('Cualquier tipo')
    }

    // Restaurar Modos (Venta/Alquiler)
    const urlModos = searchParams.getAll('modoInmueble')
    if (urlModos.length > 0) {
      setModosSeleccionados(urlModos)
    } else {
      setModosSeleccionados(['VENTA']) // Default
    }

    // Restaurar Ubicación/Texto Libre
    const urlQuery = searchParams.get('query')
    if (urlQuery) {
      setUbicacionTexto(urlQuery)
    } else {
      setUbicacionTexto('')
    }
  }, [searchParams, propertyTypes])

  // =======================================================================
  // 1. GENERADOR DINÁMICO DE FILTROS ACTIVOS (Fila inferior removible)
  // =======================================================================
  const activeFilters = useMemo(() => {
    const filters: { id: string; label: string; onRemove: () => void }[] = []
    if (!searchParams) return filters

    const params = new URLSearchParams(searchParams.toString())

    // Helper para eliminar parámetros y navegar
    const removeParam = (keys: string[], customAction?: () => void) => {
      keys.forEach(k => params.delete(k))
      if (customAction) customAction()
      router.push(`/busqueda_mapa${params.toString() ? `?${params.toString()}` : ''}`)
    }

    // -- Tipo Inmueble --
    const tipo = params.get('tipoInmueble')
    if (tipo && tipo !== 'CUALQUIER TIPO') {
      const tipoLabel = propertyTypes.find(pt => pt.label.toUpperCase() === tipo)?.label || tipo
      filters.push({ id: 'tipo', label: tipoLabel, onRemove: () => removeParam(['tipoInmueble'], () => setTipoInmueble('Cualquier tipo')) })
    }

    // -- Modos (Venta, Alquiler, Anticrético) --
    const modos = params.getAll('modoInmueble')
    modos.forEach(m => filters.push({
      id: `modo-${m}`,
      label: m.charAt(0).toUpperCase() + m.slice(1).toLowerCase(),
      onRemove: () => {
        const newModos = modos.filter(modo => modo !== m)
        params.delete('modoInmueble')
        newModos.forEach(nm => params.append('modoInmueble', nm))
        setModosSeleccionados(newModos)
        router.push(`/busqueda_mapa${params.toString() ? `?${params.toString()}` : ''}`)
      }
    }))

    // -- Zona (Texto) --
    const query = params.get('query')
    if (query) filters.push({ id: 'query', label: `Zona: ${query}`, onRemove: () => removeParam(['query', 'lat', 'lng', 'radius'], () => { setUbicacionTexto(''); setCoords({}) }) })

    // -- Ubicación Específica (Cascada) --
    const depId = params.get('departamentoId'); const provId = params.get('provinciaId'); const munId = params.get('municipioId'); const zonaId = params.get('zonaId'); const barId = params.get('barrioId')
    if (depId || provId || munId || zonaId || barId) {
      filters.push({ id: 'geo', label: 'Ubicación específica', onRemove: () => removeParam(['departamentoId', 'provinciaId', 'municipioId', 'zonaId', 'barrioId']) })
    }

    // -- Precio --
    const minP = params.get('minPrice'); const maxP = params.get('maxPrice')
    if (minP || maxP) {
      let lbl = 'Precio: '
      if (minP && maxP) lbl += `$${minP} a $${maxP}`
      else if (minP) lbl += `Desde $${minP}`
      else lbl += `Hasta $${maxP}`
      filters.push({ id: 'precio', label: lbl, onRemove: () => removeParam(['minPrice', 'maxPrice']) })
    }

    // -- Superficie --
    const minS = params.get('minSuperficie'); const maxS = params.get('maxSuperficie')
    if (minS || maxS) {
      let lbl = 'Sup: '
      if (minS && maxS) lbl += `${minS} a ${maxS} m²`
      else if (minS) lbl += `Desde ${minS} m²`
      else lbl += `Hasta ${maxS} m²`
      filters.push({ id: 'superficie', label: lbl, onRemove: () => removeParam(['minSuperficie', 'maxSuperficie']) })
    }

    // -- Cuartos y Baños --
    const minD = params.get('dormitoriosMin'); const maxD = params.get('dormitoriosMax')
    if (minD || maxD) filters.push({ id: 'cuartos', label: `Cuartos: ${minD || 0} a ${maxD || '+'}`, onRemove: () => removeParam(['dormitoriosMin', 'dormitoriosMax']) })

    const minB = params.get('banosMin'); const maxB = params.get('banosMax')
    if (minB || maxB) filters.push({ id: 'banos', label: `Baños: ${minB || 0} a ${maxB || '+'}`, onRemove: () => removeParam(['banosMin', 'banosMax']) })

    const tipoBanoParam = params.get('tipoBano')
    if (tipoBanoParam === 'privado') {
      filters.push({ id: 'tb', label: 'Baño privado', onRemove: () => removeParam(['tipoBano']) })
    } else if (tipoBanoParam === 'compartido') {
      filters.push({ id: 'tb', label: 'Baño compartido', onRemove: () => removeParam(['tipoBano']) })
    }

    // -- Amenidades y Etiquetas (HU6) --
    const amenities = params.get('amenities')?.split(',').filter(Boolean) || []
    amenities.forEach(a => filters.push({
      id: `amenity-${a}`, label: `Amenidad: ${AMENITIES_MAP[a] || a}`,
      onRemove: () => {
        const newAm = amenities.filter(id => id !== a)
        if (newAm.length > 0) params.set('amenities', newAm.join(','))
        else params.delete('amenities')
        router.push(`/busqueda_mapa${params.toString() ? `?${params.toString()}` : ''}`)
      }
    }))

    // -- Solo ofertas (HU6) --
    const soloOfertas = searchParams?.get('soloOfertas')
    if (soloOfertas === 'true') {
      filters.push({
        id: 'solo-ofertas',
        label: 'Solo ofertas',
        onRemove: () => {
          params.delete('soloOfertas')
          router.push(`/busqueda_mapa${params.toString() ? `?${params.toString()}` : ''}`)
        }
      })
    }

    const etiquetasNombres: Record<string, string> = (() => {
      try {
        return JSON.parse(sessionStorage.getItem('propbol_etiquetas_nombres') || '{}')
      } catch {
        return {}
      }
    })()

    const labels = params.get('labels')?.split(',').filter(Boolean) || []
    labels.forEach(l => filters.push({
      id: `label-${l}`, label: etiquetasNombres[l] || `Etiqueta ${l}`,
      onRemove: () => {
        const newLb = labels.filter(id => id !== l)
        if (newLb.length > 0) params.set('labels', newLb.join(','))
        else params.delete('labels')
        router.push(`/busqueda_mapa${params.toString() ? `?${params.toString()}` : ''}`)
      }
    }))
    const orden = params.get('orden')
    if (orden === 'recomendados') {
      filters.push({
        id: 'orden-recomendados',
        label: 'Recomendados',
        onRemove: () => {
          sessionStorage.removeItem('propbol_modo_recomendados')
          sessionStorage.removeItem('propbol_recomendados')
          removeParam(['orden']) // Esto lo quita de la URL y recarga
        }
      })
    }

    return filters
  }, [searchParams, propertyTypes])

  const handleSearch = async (e?: React.FormEvent) => {

    if (e) e.preventDefault()
    const urlParams = new URLSearchParams(searchParams?.toString() || '')
    const minPrice = urlParams.get('minPrice')
    const maxPrice = urlParams.get('maxPrice')
    const minSuperficie = urlParams.get('minSuperficie')
    const maxSuperficie = urlParams.get('maxSuperficie')
    const minDorm = urlParams.get('dormitoriosMin')
    const maxDorm = urlParams.get('dormitoriosMax')
    const minBanos = urlParams.get('banosMin')
    const maxBanos = urlParams.get('banosMax')
    const tipoBanoVal = urlParams.get('tipoBano')
    const banoCompartido =
      tipoBanoVal === 'compartido' ? true : tipoBanoVal === 'privado' ? false : undefined
    const tipoMap: Record<string, string> = {
      Casas: 'CASA',
      Departamentos: 'DEPARTAMENTO',
      Terrenos: 'TERRENO',
      Cuartos: 'CUARTO',
      "Espacios Cementerio": 'TERRENO_MORTUORIO'
    }

    const tipoFinal =
      tipoMap[tipoInmueble] ||
      (tipoInmueble !== 'Cualquier tipo' ? tipoInmueble.toUpperCase() : null)

    const modosFinales = modosSeleccionados;

    const nuevosFiltros = {
      tipoInmueble: tipoFinal ? [tipoFinal] : [],
      modoInmueble: modosFinales,
      query: ubicacionTexto,
      updatedAt: new Date().toISOString(),
      precioMin: minPrice || undefined,
      precioMax: maxPrice || undefined,
      superficieMin: minSuperficie || undefined,
      superficieMax: maxSuperficie || undefined,
      dormitoriosMin: minDorm || undefined,
      dormitoriosMax: maxDorm || undefined,
      banosMin: minBanos || undefined,
      banosMax: maxBanos || undefined,
      banoCompartido
    }
    await trackSearchTelemetria({
      tipoInmueble: nuevosFiltros.tipoInmueble,
      modoInmueble: nuevosFiltros.modoInmueble,
      query: nuevosFiltros.query,
      zona: ubicacionTexto,
      precioMin: minPrice,
      precioMax: maxPrice,
      superficieMin: minSuperficie,
      superficieMax: maxSuperficie,
      dormitoriosMin: minDorm,
      dormitoriosMax: maxDorm,
      banosMin: minBanos,
      banosMax: maxBanos,
      banoCompartido: banoCompartido === true ? true : banoCompartido === false ? false : null
    })
    updateFilters(nuevosFiltros)

    const params = new URLSearchParams(searchParams?.toString() || '')
    // Limpiamos solo los filtros que maneja esta barra superior para evitar duplicados
    params.delete('modoInmueble')
    params.delete('tipoInmueble')
    params.delete('query')
    params.delete('lat')
    params.delete('lng')
    params.delete('radius')
    params.delete('orden')

    modosSeleccionados.forEach((modo) => params.append('modoInmueble', modo))
    if (tipoFinal) params.set('tipoInmueble', tipoFinal)
    if (ubicacionTexto.trim() !== '') params.set('query', ubicacionTexto.trim())
    if (coords.lat && coords.lng) {
      params.set('lat', coords.lat.toString())
      params.set('lng', coords.lng.toString())
      params.set('radius', '1') // Radio de 1km por defecto
      params.delete('departamentoId')
      params.delete('provinciaId')
      params.delete('municipioId')
      params.delete('zonaId')
      params.delete('barrioId')
      params.delete('locationId')
    }

    const queryString = params.toString()
    const targetUrl = `/busqueda_mapa${queryString ? `?${queryString}` : ''}`

    router.push(targetUrl)
    if (onSearch) onSearch(nuevosFiltros)
  }
  // Helper para manejar el cambio de location de forma uniforme
  const handleLocationChange = (val: LocationValue) => {
    if (typeof val === 'object' && val !== null) {
      setUbicacionTexto(val.nombre)
      if (val.locationId) {
        // Si tenemos locationId, VACIAMOS las coordenadas para que el backend busque en toda la zona
        setCoords({})
      } else {
        setCoords({ lat: val.lat, lng: val.lng })
      }
    } else {
      setUbicacionTexto(val as string)
      setCoords({}) // Si es solo texto del historial, borramos las coordenadas
    }
  }
  const isRecomendadosActive = searchParams?.get('orden') === 'recomendados'


  // FIX Z-INDEX MASIVO: Agregamos z-[99999] y !overflow-visible para aplastar al mapa
  const containerStyles =
    variant === 'map'
      ? 'bg-[#faf9f6] dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 py-2 px-4 w-full flex flex-col gap-2 shadow-sm sticky top-0 z-[9999] !overflow-visible transition-colors dark:shadow-stone-900/20'
      : 'bg-white dark:bg-stone-900 shadow-lg rounded-[30px] p-6 flex flex-col gap-6 w-full max-w-[921px] relative z-[999999] !overflow-visible transition-colors'
  return (
    <form className={containerStyles} onSubmit={handleSearch}>

      {/* ========================================================= */}
      {/* LAYOUT PARA MAPA (Nuevo Diseño) */}
      {/* ========================================================= */}
      {variant === 'map' && (
        <div className="flex flex-col gap-3 w-full max-w-screen-2xl mx-auto">

          {/* FILA 1: Tipo | Modos (Venta/Alquiler) | Ubicación | Buscar */}
          <div className="flex flex-wrap md:flex-nowrap items-center w-full gap-3 relative z-[100] !overflow-visible">

            <div className="w-full md:w-48 xl:w-56 shrink-0 relative z-[100] !overflow-visible">
              <ComboBox label="" placeholder="Cualquier tipo" icon={Home} options={propertyTypes} onChange={(val) => setTipoInmueble(val)} value={tipoInmueble} />
            </div>

            <div className="shrink-0 flex items-center h-[42px] bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2 shadow-sm relative z-[90]">
              <TransactionModeFilter modoSeleccionado={modosSeleccionados} onModoChange={setModosSeleccionados} />
            </div>

            <div className="flex-1 min-w-[200px] relative z-[90] !overflow-visible">
              <LocationSearch value={ubicacionTexto} onChange={handleLocationChange} />
            </div>

            <div className="shrink-0 w-full md:w-auto relative z-10">
              <button type="submit" className="w-full md:w-auto h-[42px] px-8 bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
                <SearchIcon size={18} />
              </button>
            </div>
          </div>

          {/* FILA 2: Filtros Rápidos (Píldoras) */}
          <div className="flex flex-wrap items-center gap-3 relative z-[80] justify-center md:justify-start">
            <button type="button" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('abrirPanelUbicacion')); }} className={`h-[38px] flex items-center gap-2 px-4 rounded-full border text-sm font-medium shadow-sm transition-all focus:outline-none shrink-0 ${isZonaFilterActive ? 'bg-[#d97706] text-white border-[#d97706] dark:bg-[#E87C1E] dark:border-[#E87C1E]' : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-[#d97706] dark:hover:border-[#E87C1E] dark:hover:bg-stone-700'}`}>
              <MapPin className={`w-4 h-4 ${isZonaFilterActive ? 'text-white' : 'text-stone-500 dark:text-stone-400'}`} />
              <span>Zona</span>
            </button>

            <button type="button" onClick={(e) => { e.preventDefault(); onOpenPriceFilter?.() }} className={`h-[38px] flex items-center gap-2 px-4 rounded-full border text-sm font-medium shadow-sm transition-all focus:outline-none shrink-0 ${isPriceFilterActive ? 'bg-[#d97706] text-white border-[#d97706] dark:bg-[#E87C1E] dark:border-[#E87C1E]' : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-[#d97706] dark:hover:border-[#E87C1E] dark:hover:bg-stone-700'}`}>
              <DollarSign className={`w-4 h-4 ${isPriceFilterActive ? 'text-white' : 'text-stone-500 dark:text-stone-400'}`} />
              <span>Precio</span>
              <ChevronDown className={`w-4 h-4 ${isPriceFilterActive ? 'text-white' : 'text-stone-400 dark:text-stone-400'}`} />
            </button>

            <div className="shrink-0">
              <CapacidadButton variant={variant} isActive={isCapacidadActive} onClick={onToggleCapacidad} />
            </div>

            <button type="button" onClick={() => onOpenSuperficieFilter?.()} className={`h-[38px] flex items-center gap-2 px-4 rounded-full border text-sm font-medium shadow-sm transition-all focus:outline-none shrink-0 ${isSuperficieFilterActive ? 'bg-[#d97706] text-white border-[#d97706] dark:bg-[#E87C1E] dark:border-[#E87C1E]' : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-[#d97706] dark:hover:border-[#E87C1E] dark:hover:bg-stone-700'}`}>
              <Maximize className={`w-4 h-4 ${isSuperficieFilterActive ? 'text-white' : 'text-stone-500 dark:text-stone-400'}`} />
              <span>Metros</span>
              <ChevronDown className={`w-4 h-4 ${isSuperficieFilterActive ? 'text-white' : 'text-stone-400 dark:text-stone-400'}`} />
            </button>

            <button type="button" onClick={() => onOpenEtiquetasFilter?.()} className={`h-[38px] flex items-center gap-2 px-4 rounded-full border text-sm font-medium shadow-sm transition-all focus:outline-none shrink-0 ${isEtiquetasFilterActive ? 'bg-[#d97706] text-white border-[#d97706] dark:bg-[#E87C1E] dark:border-[#E87C1E]' : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-[#d97706] dark:hover:border-[#E87C1E] dark:hover:bg-stone-700'}`}>
              <Tag className={`w-4 h-4 ${isEtiquetasFilterActive ? 'text-white' : 'text-stone-500 dark:text-stone-400'}`} />
              <span>Etiquetas</span>
              <ChevronDown className={`w-4 h-4 ${isEtiquetasFilterActive ? 'text-white' : 'text-stone-400 dark:text-stone-400'}`} />
            </button>

            {/* Modal de Filtros Avanzados */}
            <button type="button" onClick={() => setIsAdvancedFiltersOpen(true)} className="h-[38px] flex items-center gap-2 px-4 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-sm font-medium hover:border-[#d97706] dark:hover:border-[#E87C1E] dark:hover:bg-stone-700 shadow-sm transition-all focus:outline-none shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-stone-500 dark:text-stone-400" />
              <span>Más Filtros</span>
            </button>

            <OfertaButton
              variant={variant}
              isActive={isOfertaActive}
              onClick={onToggleOferta}
            />

            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault()

                const params = new URLSearchParams(searchParams?.toString() || '')
                const isActive = params.get('orden') === 'recomendados'

                if (isActive) {
                  const savedFilters = sessionStorage.getItem('propbol_filtros_respaldo')
                  if (savedFilters) {
                    const restoredParams = new URLSearchParams(savedFilters)
                    restoredParams.delete('orden')
                    restoredParams.delete('ia')
                    router.push(`/busqueda_mapa?${restoredParams.toString()}`)
                    sessionStorage.removeItem('propbol_filtros_respaldo')
                  } else {
                    params.delete('orden')
                    params.delete('ia')
                    router.push(`/busqueda_mapa${params.toString() ? `?${params.toString()}` : ''}`)
                  }
                  sessionStorage.removeItem('propbol_modo_recomendados')
                  sessionStorage.removeItem('propbol_recomendados')
                  return
                }

                sessionStorage.setItem('propbol_filtros_respaldo', params.toString())



                const cleanParams = new URLSearchParams()
                const modoInmueble = params.getAll('modoInmueble')
                modoInmueble.forEach(m => cleanParams.append('modoInmueble', m))
                cleanParams.set('orden', 'recomendados')
                cleanParams.set('ia', '1')


                const token = localStorage.getItem('token')
                if (token) {
                  try {
                    const res = await fetch(`/api/inmuebles/recomendados?${cleanParams.toString()}`, {
                      headers: { Authorization: `Bearer ${token}` }
                    })
                    const data = await res.json()
                    if (data.success && data.data.length > 0) {
                      sessionStorage.setItem('propbol_recomendados', JSON.stringify(data.data))
                      sessionStorage.setItem('propbol_modo_recomendados', 'true')
                    }
                  } catch (error) {
                    console.error('Error obteniendo recomendaciones:', error)
                    // Fallback silencioso: useProperties cargará los populares
                  }
                } else {
                  // ── Visitante sin cuenta → más populares de su zona ────────────────
                  // No bloqueamos ni mostramos error. useProperties detectará
                  // propbol_modo_recomendados=true y cargará los populares.
                  // Opcionalmente pre-cargamos los populares para más rapidez:
                  try {
                    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
                    const res = await fetch(
                      `${API_BASE}/api/properties/inmuebles?fecha=mas-populares&${cleanParams.toString()}`
                    )
                    const data = await res.json()
                    if (data.ok && data.data?.length > 0) {
                      sessionStorage.setItem('propbol_recomendados', JSON.stringify(data.data))
                      sessionStorage.setItem('propbol_modo_recomendados', 'true')
                    }
                  } catch (error) {
                    console.error('Error cargando populares para visitante:', error)
                    // useProperties hará la carga normal como fallback
                  }
                }

                router.push(`/busqueda_mapa?${cleanParams.toString()}`)
              }}



              className={`h-[38px] flex items-center gap-2 px-4 rounded-full border text-sm font-medium shadow-sm transition-all focus:outline-none shrink-0 ${searchParams?.get('orden') === 'recomendados'
                  ? 'bg-[#d97706] text-white border-[#d97706] dark:bg-[#E87C1E] dark:border-[#E87C1E]'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-[#d97706] dark:hover:border-[#E87C1E] dark:hover:bg-stone-700'
                }`}
            >
              <Award className={`w-4 h-4 ${searchParams?.get('orden') === 'recomendados' ? 'text-white' : 'text-stone-500'}`} />
              <span>Recomendados</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleCompareMode();
              }}
              className={`h-[38px] flex items-center gap-2 px-4 rounded-full border text-sm font-medium shadow-sm transition-all focus:outline-none shrink-0 ${isCompareMode
                ? 'bg-[#d97706] text-white border-[#d97706] dark:bg-[#E87C1E] dark:border-[#E87C1E]'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-[#d97706] dark:hover:border-[#E87C1E] dark:hover:bg-stone-700'
                }`}
            >
              <BarChart2 className={`w-4 h-4 ${isCompareMode ? 'text-white' : 'text-stone-500'}`} />
              <span>Comparar {isCompareMode && selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
            </button>
          </div>

          {/* FILA 3: ETIQUETAS DE FILTROS ACTIVOS (Chips Removibles) */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-white/60 dark:bg-stone-950/60 backdrop-blur-sm border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 w-full shadow-inner min-h-[48px]">
              <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider ml-2 mr-1">Activos:</span>

              {activeFilters.map(filter => (
                <div key={filter.id} className="group flex items-center gap-1.5 bg-[#fdf3e7] dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 text-orange-800 dark:text-orange-300 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all hover:bg-orange-100 dark:hover:bg-orange-500/40 animate-in fade-in zoom-in duration-200">
                  <span className="max-w-[160px] truncate">{filter.label}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); filter.onRemove() }}
                    className="hover:bg-orange-200 rounded-full p-0.5 transition-colors focus:outline-none"
                    title={`Quitar filtro: ${filter.label}`}
                  >
                    <X size={14} className="text-orange-600 group-hover:text-orange-700" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()

                  // 1. Vaciamos todos los estados visuales por completo
                  setTipoInmueble('Cualquier tipo')
                  setModosSeleccionados([]) // Arreglo vacío para desmarcar todos los checkboxes
                  setUbicacionTexto('')
                  setCoords({})

                  // 2. Limpiamos la memoria del navegador para matar los filtros "fantasma"
                  sessionStorage.removeItem('propbol_global_filters')
                  sessionStorage.removeItem('propbol_modo_recomendados')
                  sessionStorage.removeItem('propbol_recomendados')

                  // 3. Reseteamos la URL a su estado más puro
                  router.push('/busqueda_mapa')
                }}
                className="text-xs font-bold text-stone-400 hover:text-stone-600 underline ml-auto mr-3 transition-colors"
              >
                Limpiar todos
              </button>
            </div>
          )}

        </div>
      )}

      {/* ===== LAYOUT PARA HOME ===== */}
      {variant === 'home' && (
        <div className="flex items-center w-full gap-3 relative z-[90] !overflow-visible flex-col md:flex-row flex-wrap">
          <div className="flex w-full relative z-[100] !overflow-visible justify-center">
            <TransactionModeFilter modoSeleccionado={modosSeleccionados} onModoChange={setModosSeleccionados} />
          </div>
          <div className="relative z-[100] !overflow-visible w-full md:w-64">
            <ComboBox label="Tipo" placeholder="Cualquier tipo" icon={Home} options={propertyTypes} onChange={setTipoInmueble} value={tipoInmueble} />
          </div>
          <div className="relative z-[90] !overflow-visible w-full flex-1">
            <LocationSearch value={ubicacionTexto} onChange={handleLocationChange} />
          </div>
          <div className="w-full md:w-auto flex justify-end relative z-10">
            <button type="submit" className="w-full md:w-auto h-[46px] px-10 bg-[#d97706] hover:bg-[#b95e00] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
              <SearchIcon size={18} /> BUSCAR
            </button>
          </div>
        </div>
      )}

      {/* ===== MODAL HU6 ===== */}
      <AdvancedFiltersModal
        isOpen={isAdvancedFiltersOpen}
        onClose={() => setIsAdvancedFiltersOpen(false)}
        onApply={(amenities, labels) => {
          const params = new URLSearchParams(searchParams?.toString() || '')

          if (amenities.length > 0) params.set('amenities', amenities.join(','))
          else params.delete('amenities')

          if (labels.length > 0) params.set('labels', labels.join(','))
          else params.delete('labels')

          router.push(`/busqueda_mapa${params.toString() ? `?${params.toString()}` : ''}`)
          setIsAdvancedFiltersOpen(false)
        }}
      />
    </form>
  )
}