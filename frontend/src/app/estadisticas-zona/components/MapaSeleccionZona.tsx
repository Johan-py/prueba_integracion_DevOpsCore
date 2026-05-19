'use client'
import { useEffect, useState } from 'react'
import { MapPin, X, SlidersHorizontal } from 'lucide-react'
import {
  MapContainer,
  TileLayer,
  Polygon,
  useMap
} from 'react-leaflet'
import L from 'leaflet'
import type { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { ZonaPredefinida } from '@/types/zona'
import type { TipoOperacion, ZonaSeleccionada } from '../page'

// Usa rutas internas Next.js que proxean al backend local (sin CORS)

// Centro Cochabamba — donde están las zonas según el perfil
const CENTRO_DEFAULT: LatLngExpression = [-17.3895, -66.1568]

interface Props {
  zonaActual: ZonaSeleccionada | null
  tipoOperacion: TipoOperacion
  onSeleccionar: (zona: ZonaSeleccionada) => void
  onCerrar: () => void
  onTipoOperacionChange: (tipo: TipoOperacion) => void
  onVerEstadisticas: () => void
}

const TIPOS: { valor: TipoOperacion; label: string }[] = [
  { valor: 'VENTA', label: 'Venta' },
  { valor: 'ALQUILER', label: 'Alquiler' },
  { valor: 'ANTICRETO', label: 'Anticrético' }
]

// Centra el mapa SIN animación para evitar el crash de classList en Leaflet
function CenterMap({ center }: { center: LatLngExpression | null }) {
  const map = useMap()
  useEffect(() => {
    if (!center) return
    try {
      // animate: false evita el crash "Cannot read properties of undefined (reading 'classList')"
      map.setView(center, 14, { animate: false })
    } catch {
      // ignorar si el mapa ya fue desmontado
    }
  }, [center, map])
  return null
}

// Ajusta el mapa para mostrar todas las zonas al cargarlas (solo una vez)
function FitToZones({ zonas }: { zonas: ZonaPredefinida[] }) {
  const map = useMap()
  const [fitted, setFitted] = useState(false)

  useEffect(() => {
    if (fitted || zonas.length === 0) return
    try {
      const allCoords = zonas.flatMap((z) => z.coordenadas)
      if (allCoords.length === 0) return
      const bounds = L.latLngBounds(allCoords as L.LatLngTuple[])
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30], animate: false, maxZoom: 15 })
        setFitted(true)
      }
    } catch {
      // ignorar errores de bounds
    }
  }, [zonas, map, fitted])

  return null
}

// Calcula el centro de un polígono
function calcularCentro(coordenadas: [number, number][]): LatLngExpression {
  const lats = coordenadas.map((c) => c[0])
  const lngs = coordenadas.map((c) => c[1])
  return [
    (Math.min(...lats) + Math.max(...lats)) / 2,
    (Math.min(...lngs) + Math.max(...lngs)) / 2
  ]
}

export default function MapaSeleccionZona({
  zonaActual,
  tipoOperacion,
  onSeleccionar,
  onCerrar,
  onTipoOperacionChange,
  onVerEstadisticas
}: Props) {
  const [zonas, setZonas] = useState<ZonaPredefinida[]>([])
  const [zonaHover, setZonaHover] = useState<number | null>(null)
  const [centroMapa, setCentroMapa] = useState<LatLngExpression | null>(null)

  // Carga zonas desde /api/zonas (coordenadas ya en [lat, lng] para Leaflet)
  useEffect(() => {
    fetch('/api/zonas-mapa')
      .then((r) => r.json())
      .then((json) => {
        const data: ZonaPredefinida[] = json.data ?? []
        const validas = data.filter(
          (z) => Array.isArray(z.coordenadas) && z.coordenadas.length >= 3
        )
        setZonas(validas)
      })
      .catch(() => { })
  }, [])

  const handleClickZona = (zona: ZonaPredefinida) => {
    onSeleccionar({ id: zona.id, nombre: zona.nombre })
    if (zona.coordenadas?.length > 0) {
      setCentroMapa(calcularCentro(zona.coordenadas))
    }
  }

  const puedeVerEstadisticas = zonaActual !== null && zonaActual.id > 0

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar() }}
    >
      <div
        className="bg-[#FAF8F5] rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* ── Header siempre visible ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Seleccionar zona en el mapa</h2>
            <p className="text-xs text-gray-500 mt-0.5">Haz clic en una zona para seleccionarla.</p>
          </div>
          <button
            onClick={onCerrar}
            id="btn-cerrar-mapa"
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Cerrar mapa"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Cuerpo ── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Sidebar */}
          <div className="w-64 bg-white border-r border-gray-100 flex flex-col gap-4 p-4 overflow-y-auto flex-shrink-0">

            {/* Zona seleccionada */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Zona seleccionada</p>
              {puedeVerEstadisticas ? (
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <MapPin size={14} className="text-[#E07B2A] flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-800 flex-1 truncate">{zonaActual.nombre}</span>
                  <button
                    onClick={() => onSeleccionar({ id: 0, nombre: '' })}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    title="Quitar selección"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-400">Ninguna zona seleccionada</span>
                </div>
              )}
            </div>

            {/* Tipo de operación */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tipo de operación</p>
              <div className="flex flex-col gap-2">
                {TIPOS.map(({ valor, label }) => (
                  <button
                    key={valor}
                    id={`btn-mapa-tipo-${valor.toLowerCase()}`}
                    onClick={() => onTipoOperacionChange(valor)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all text-left ${tipoOperacion === valor
                      ? 'bg-[#E07B2A] text-white border-[#E07B2A] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#E07B2A] hover:text-[#E07B2A]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Info zonas */}
            {zonas.length > 0 && (
              <p className="text-xs text-gray-400">
                {zonas.length} zona{zonas.length !== 1 ? 's' : ''} disponible{zonas.length !== 1 ? 's' : ''} en el mapa.
              </p>
            )}

            {/* Botón Ver estadísticas */}
            <div className="mt-auto">
              <button
                id="btn-mapa-ver-estadisticas"
                onClick={onVerEstadisticas}
                disabled={!puedeVerEstadisticas}
                className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${puedeVerEstadisticas
                  ? 'bg-[#E07B2A] text-white hover:bg-[#c96a1d] shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                <SlidersHorizontal size={15} />
                Ver estadísticas
              </button>
              {!puedeVerEstadisticas && (
                <p className="text-xs text-gray-400 text-center mt-2">Selecciona una zona primero</p>
              )}
            </div>
          </div>

          {/* Mapa */}
          <div className="flex-1 relative min-w-0">
            <MapContainer
              center={CENTRO_DEFAULT}
              zoom={13}
              className="w-full h-full"
              zoomControl={true}
              style={{ minHeight: '400px' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
              />

              {/* Auto-ajusta vista para mostrar todas las zonas */}
              <FitToZones zonas={zonas} />

              {/* Centra en la zona seleccionada (sin animación) */}
              {centroMapa && <CenterMap center={centroMapa} />}

              {/* Polígonos */}
              {zonas.map((zona) => {
                const esSeleccionada = zonaActual?.id === zona.id
                const esHover = zonaHover === zona.id
                const positions = zona.coordenadas as LatLngExpression[]

                return (
                  <Polygon
                    key={zona.id}
                    positions={positions}
                    pathOptions={{
                      fillColor: esSeleccionada ? '#1D4ED8' : '#E07B2A',
                      fillOpacity: esSeleccionada ? 0.4 : esHover ? 0.3 : 0.12,
                      color: esSeleccionada ? '#1D4ED8' : '#E07B2A',
                      weight: esSeleccionada ? 2.5 : 1.5
                    }}
                    eventHandlers={{
                      click: () => handleClickZona(zona),
                      mouseover: (e) => {
                        setZonaHover(zona.id)
                        const el = (e.target as L.Path).getElement()
                        if (el) (el as HTMLElement).style.cursor = 'pointer'
                      },
                      mouseout: () => setZonaHover(null)
                    }}
                  />
                )
              })}
            </MapContainer>

            {/* Overlay: nombre de zona al hacer hover */}
            {zonaHover && (() => {
              const zona = zonas.find((z) => z.id === zonaHover)
              return zona ? (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow text-sm font-medium text-gray-800 pointer-events-none z-[999]">
                  {zona.nombre}
                </div>
              ) : null
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
