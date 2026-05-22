'use client'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
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

  // Carga zonas desde /api/zonas (MOCK para Code Freeze con coordenadas de polígonos)
  useEffect(() => {
    const MOCK_ZONAS = [
      {
        id: 1,
        nombre: 'Cala Cala',
        coordenadas: [[-17.375, -66.165], [-17.375, -66.155], [-17.365, -66.155], [-17.365, -66.165]]
      },
      {
        id: 2,
        nombre: 'Queru Queru',
        coordenadas: [[-17.370, -66.150], [-17.370, -66.140], [-17.360, -66.140], [-17.360, -66.150]]
      },
      {
        id: 3,
        nombre: 'Muyurina',
        coordenadas: [[-17.385, -66.145], [-17.385, -66.135], [-17.375, -66.135], [-17.375, -66.145]]
      },
      {
        id: 4,
        nombre: 'Sacaba',
        coordenadas: [[-17.380, -66.050], [-17.380, -66.030], [-17.400, -66.030], [-17.400, -66.050]]
      },
      {
        id: 5,
        nombre: 'Quillacollo',
        coordenadas: [[-17.390, -66.280], [-17.390, -66.260], [-17.410, -66.260], [-17.410, -66.280]]
      },
      {
        id: 6,
        nombre: 'Punata',
        coordenadas: [[-17.530, -65.840], [-17.530, -65.820], [-17.550, -65.820], [-17.550, -65.840]]
      },
      {
        id: 7,
        nombre: 'Cliza',
        coordenadas: [[-17.570, -65.940], [-17.570, -65.920], [-17.590, -65.920], [-17.590, -65.940]]
      },
      {
        id: 8,
        nombre: 'Tarata',
        coordenadas: [[-17.600, -66.030], [-17.600, -66.010], [-17.620, -66.010], [-17.620, -66.030]]
      }
    ];
    // Forzamos el tipado para que Leaflet acepte nuestras coordenadas simuladas
    setZonas(MOCK_ZONAS as any);
  }, [])

  const handleClickZona = (zona: ZonaPredefinida) => {
    onSeleccionar({ id: zona.id, nombre: zona.nombre })
    if (zona.coordenadas?.length > 0) {
      setCentroMapa(calcularCentro(zona.coordenadas))
    }
  }

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
          {/* Mapa (Ahora ocupa el 100% del espacio al eliminar el sidebar redundante) */}
          <div className="flex-1 relative min-w-0 w-full">
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