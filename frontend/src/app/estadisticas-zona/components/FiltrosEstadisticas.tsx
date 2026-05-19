'use client'
import { useState, useEffect } from 'react'
import { MapPin, Search, X, ChevronRight } from 'lucide-react'
import type { TipoOperacion, ZonaSeleccionada } from '../page'

// Usa la ruta proxy interna de Next.js para evitar CORS y dependencia del backend externo

interface Props {
  zonaSeleccionada: ZonaSeleccionada | null
  tipoOperacion: TipoOperacion
  cargando: boolean
  error: string | null
  onZonaChange: (zona: ZonaSeleccionada | null) => void
  onTipoOperacionChange: (tipo: TipoOperacion) => void
  onConsultar: () => void
  onAbrirMapa: () => void
}

interface ZonaOpcion {
  id: number
  nombre: string
}

const TIPOS: { valor: TipoOperacion; label: string }[] = [
  { valor: 'VENTA', label: 'Venta' },
  { valor: 'ALQUILER', label: 'Alquiler' },
  { valor: 'ANTICRETO', label: 'Anticrético' }
]

export default function FiltrosEstadisticas({
  zonaSeleccionada,
  tipoOperacion,
  cargando,
  error,
  onZonaChange,
  onTipoOperacionChange,
  onConsultar,
  onAbrirMapa
}: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [zonas, setZonas] = useState<ZonaOpcion[]>([])
  const [zonasFiltradas, setZonasFiltradas] = useState<ZonaOpcion[]>([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)

  // Cargar zonas disponibles
  useEffect(() => {
    fetch('/api/estadisticas-zona/zonas')
      .then((r) => r.json())
      .then((json) => {
        if (json.ok && Array.isArray(json.data)) setZonas(json.data)
      })
      .catch(() => { })
  }, [])

  // Filtrar por búsqueda
  useEffect(() => {
    if (!busqueda.trim()) {
      setZonasFiltradas([])
      return
    }
    const termino = busqueda.toLowerCase()
    setZonasFiltradas(zonas.filter((z) => z.nombre.toLowerCase().includes(termino)).slice(0, 8))
  }, [busqueda, zonas])

  const seleccionarZona = (zona: ZonaOpcion) => {
    onZonaChange(zona)
    setBusqueda(zona.nombre)
    setMostrarSugerencias(false)
  }

  const limpiarZona = () => {
    onZonaChange(null)
    setBusqueda('')
    setMostrarSugerencias(false)
  }

  // CA 6: Ambos filtros son requeridos
  const puedeConsultar = zonaSeleccionada !== null && tipoOperacion !== null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Panel izquierdo: Filtros */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Paso 1: Zona */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">1. Selecciona la zona</p>
            <div className="relative">
              <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-[#E07B2A]/30 focus-within:border-[#E07B2A] transition-all">
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  id="input-buscar-zona"
                  type="text"
                  placeholder="Buscar zona o barrio"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value)
                    setMostrarSugerencias(true)
                    if (!e.target.value) onZonaChange(null)
                  }}
                  onFocus={() => setMostrarSugerencias(true)}
                  onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
                  className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
                {zonaSeleccionada ? (
                  <button onClick={limpiarZona} className="text-gray-400 hover:text-gray-600">
                    <X size={15} />
                  </button>
                ) : (
                  <button
                    onClick={onAbrirMapa}
                    id="btn-abrir-mapa-zona"
                    className="text-gray-400 hover:text-[#E07B2A] transition-colors"
                    title="Seleccionar en el mapa"
                  >
                    <MapPin size={16} />
                  </button>
                )}
              </div>

              {/* Sugerencias */}
              {mostrarSugerencias && zonasFiltradas.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  {zonasFiltradas.map((zona) => (
                    <li key={zona.id}>
                      <button
                        onMouseDown={() => seleccionarZona(zona)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-orange-50 transition-colors"
                      >
                        <MapPin size={13} className="text-[#E07B2A] flex-shrink-0" />
                        {zona.nombre}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Botón ver en mapa si no hay zona seleccionada */}
              {!zonaSeleccionada && (
                <button
                  onClick={onAbrirMapa}
                  className="mt-2 flex items-center gap-1.5 text-xs text-[#E07B2A] hover:text-[#c96a1d] transition-colors font-medium"
                >
                  <MapPin size={12} />
                  Ver en el mapa
                  <ChevronRight size={12} />
                </button>
              )}

              {/* Zona seleccionada */}
              {zonaSeleccionada && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-[#E07B2A] font-medium">
                  <MapPin size={12} />
                  {zonaSeleccionada.nombre}
                </div>
              )}
            </div>
          </div>

          {/* Paso 2: Tipo de operación */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              2. Selecciona el tipo de operación
            </p>
            <div className="flex gap-2 flex-wrap">
              {TIPOS.map(({ valor, label }) => (
                <button
                  key={valor}
                  id={`btn-tipo-${valor.toLowerCase()}`}
                  onClick={() => onTipoOperacionChange(valor)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${tipoOperacion === valor
                      ? 'bg-[#E07B2A] text-white border-[#E07B2A] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#E07B2A] hover:text-[#E07B2A]'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
            <X size={14} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* CA 6: Mensaje si falta algún filtro */}
        {!puedeConsultar && (
          <p className="mt-4 text-xs text-gray-400">
            Selecciona una zona y un tipo de operación para habilitar la consulta.
          </p>
        )}
      </div>

      {/* Panel derecho: Placeholder / Acción */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center gap-4 min-h-[200px]">
        {zonaSeleccionada ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-[#FFF5EA] flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E07B2A" strokeWidth="1.8">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-800">{zonaSeleccionada.nombre}</p>
              <p className="text-xs text-[#E07B2A] mt-1 font-medium">
                {TIPOS.find((t) => t.valor === tipoOperacion)?.label}
              </p>
            </div>
            <button
              id="btn-ver-estadisticas"
              onClick={onConsultar}
              disabled={cargando || !puedeConsultar}
              className="w-full py-2.5 rounded-xl bg-[#E07B2A] text-white text-sm font-semibold hover:bg-[#c96a1d] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Calculando…
                </>
              ) : (
                'Ver estadísticas'
              )}
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-[#FFF5EA] flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E07B2A" strokeWidth="1.8">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 text-center leading-relaxed">
              Selecciona una zona y un tipo de operación para ver las estadísticas.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
