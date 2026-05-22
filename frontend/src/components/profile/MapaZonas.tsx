'use client'

import { useEffect, useState } from "react"
import {
    MapContainer as BaseMapContainer,
    TileLayer,
    Marker,
    Popup,
    Polygon,
    useMap,
} from "react-leaflet"
import type { LatLngExpression } from "leaflet"

// Importar L dinámicamente para evitar errores de SSR
let L: any
if (typeof window !== 'undefined') {
    L = require('leaflet')
}

interface GestureMapProps extends React.ComponentProps<typeof BaseMapContainer> {
  gestureHandling?: boolean;
  gestureHandlingOptions?: {
    text: {
      touch: string;
      scroll: string;
      scrollMac: string;
    };
  };
}

const MapContainer = BaseMapContainer as React.ComponentType<GestureMapProps>;

interface Zona {
    id: number
    nombre: string
    referencia: string
    mostrarPropiedades: boolean
    geometria?: any
    coordenadas?: { lat: number; lng: number; zoom: number }
}

interface Propiedad {
    id: number
    titulo: string
    tipo_accion: string
    precio: string
    superficie_m2: string
    nro_cuartos: number | null
    nro_banos: number | null
    direccion: string
    ciudad: string
    zona: string
    latitud: number | null
    longitud: number | null
    imagen: string | null
    propietario: string
    contacto: string
    zonaId?: number
}

interface MapaZonasProps {
    zonas: Zona[] // Todas las zonas para mostrar en el mapa
    zonasConPropiedades: number[] // IDs de zonas donde mostrar propiedades
    zonaSeleccionadaId?: number | null
 }

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const COLORES_TIPO: Record<string, string> = {
    VENTA: "#3b82f6",
    ALQUILER: "#8b5cf6",
    ANTICRETO: "#f59e0b",
}

// Configurar los iconos solo en el cliente
if (typeof window !== "undefined" && L) {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
    // Agregar el plugin de gesture handling para móviles MAPAS HU11
    const { GestureHandling } = require('leaflet-gesture-handling')
    L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling)
}

function createPropiedadIcon(tipo: string): L.DivIcon {
    const color = COLORES_TIPO[tipo] || "#6b7280"

    return L.divIcon({
        className: "",
        html: `
      <div style="
        background:${color};
        color:white;
        font-size:10px;
        font-weight:bold;
        padding:3px 8px;
        border-radius:12px;
        white-space:nowrap;
        box-shadow:0 2px 6px rgba(0,0,0,0.25);
        border:2px solid white;
      ">${tipo}</div>
    `,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
        popupAnchor: [0, -16],
    })
}

// Convertir geometría del backend a formato Leaflet
function getPolygonFromGeometria(geometria: any): LatLngExpression[] | null {
    if (!geometria || geometria.type !== 'Polygon') return null

    try {
        const coordinates = geometria.coordinates[0]
        return coordinates.map((coord: number[]) => [coord[1], coord[0]]) as LatLngExpression[]
    } catch (e) {
        console.error('Error convirtiendo geometría:', e)
        return null
    }
}

export default function MapaZonas({
    zonas = [],
    zonasConPropiedades,
    zonaSeleccionadaId = null,
}: MapaZonasProps) {
    const center: [number, number] = [-17.3895, -66.1568]
    const [propiedades, setPropiedades] = useState<Propiedad[]>([])
    const [isLoadingPropiedades, setIsLoadingPropiedades] = useState(false)
    const [propiedadesPorZona, setPropiedadesPorZona] = useState<Record<number, Propiedad[]>>({})
    const getToken = () => localStorage.getItem('token')

    // Cargar propiedades solo para las zonas seleccionadas
    useEffect(() => {
        const cargarPropiedadesParaZonas = async () => {
            if (zonasConPropiedades.length === 0) {
                setPropiedadesPorZona({})
                setPropiedades([])
                return
            }

            setIsLoadingPropiedades(true)
            const token = getToken()
            if (!token) {
                setIsLoadingPropiedades(false)
                return
            }

            const nuevasPropiedadesPorZona: Record<number, Propiedad[]> = {}
            const todasLasPropiedades: Propiedad[] = []

            // Cargar propiedades solo para las zonas seleccionadas
            for (const zonaId of zonasConPropiedades) {
                try {
                    const response = await fetch(`${API_URL}/api/perfil/zonas/${zonaId}/propiedades`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })

                    if (response.ok) {
                        const data = await response.json()
                        if (data.success && data.data) {
                            const propiedadesConZona = data.data.map((prop: Propiedad) => ({
                                ...prop,
                                zonaId: zonaId
                            }))
                            nuevasPropiedadesPorZona[zonaId] = propiedadesConZona
                            todasLasPropiedades.push(...propiedadesConZona)
                        }
                    }
                } catch (error) {
                    console.error(`Error cargando propiedades para zona ${zonaId}:`, error)
                    nuevasPropiedadesPorZona[zonaId] = []
                }
            }

            setPropiedadesPorZona(nuevasPropiedadesPorZona)
            setPropiedades(todasLasPropiedades)
            setIsLoadingPropiedades(false)
        }

        cargarPropiedadesParaZonas()
    }, [zonasConPropiedades]) // Re-cargar cuando cambian las zonas seleccionadas

    // Si L no está cargado (SSR), mostrar un placeholder
    if (!L) {
        return (
            <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                <p className="text-stone-500">Cargando mapa...</p>
            </div>
        )
    }

    function DobleToque() {
        const map = useMap()

        // 4 y 6. Double tap zoom + one-finger zoom
useEffect(() => {
    const DOUBLE_TAP_DELAY = 300
    const DRAG_THRESHOLD = 10

    let lastTapTime = 0
    let secondTap = false
    let isDraggingZoom = false
    let touchStartTime = 0

    let startY = 0
    let startZoom = 0

    const container = map.getContainer()

    const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length !== 1) return

        const now = Date.now()
        const timeSinceLast = now - lastTapTime

        if (timeSinceLast < DOUBLE_TAP_DELAY) {
        secondTap = true
        touchStartTime = now
        startY = e.touches[0].clientY
        startZoom = map.getZoom()

        if (e.cancelable) {
            e.preventDefault()
        }
        } else {
        secondTap = false
        isDraggingZoom = false
        }

        lastTapTime = now
    }

    const handleTouchMove = (e: TouchEvent) => {
        if (!secondTap) return

        if (e.cancelable) { e.preventDefault() }

        const currentY = e.touches[0].clientY
        const deltaY = startY - currentY

        if (Math.abs(deltaY) > DRAG_THRESHOLD) {
            isDraggingZoom = true

            const zoomDelta = deltaY / 80

            map.setZoom(startZoom + zoomDelta, {
                animate: false
            })
        }
    }

    const handleTouchEnd = (e: TouchEvent) => {
        if (!secondTap || e.touches.length !== 1) return
        e.preventDefault()
        e.stopPropagation()

        // Doble toque normal
        if (!isDraggingZoom) {
            const touch = e.changedTouches[0]
            const rect = container.getBoundingClientRect()

            const point = L.point(
                touch.clientX - rect.left,
                touch.clientY - rect.top
            )

            const latlng = map.containerPointToLatLng(point)

            map.flyTo(
                latlng,
                Math.min(map.getZoom() + 1, 19),
                {
                    duration: 0.35
                }
            )
        }

        secondTap = false
        isDraggingZoom = false
    }

    container.addEventListener('touchstart', handleTouchStart, {
        passive: false
    })

    container.addEventListener('touchmove', handleTouchMove, {
        passive: false
    })

    container.addEventListener('touchend', handleTouchEnd)

    return () => {
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
        container.removeEventListener('touchend', handleTouchEnd)
    }
}, [map])
    
        // Doble toque con dos dedos para alejar zoom
        useEffect(() => {
            let lastTwoFingerTapTime = 0
            let maxTouchCount = 0

            const handleTouchStart = (e: TouchEvent) => {
                if (e.touches.length > maxTouchCount) {
                    maxTouchCount = e.touches.length
                }
            }

            const handleTouchEnd = (e: TouchEvent) => {
                if (e.touches.length !== 0) return

                if (maxTouchCount === 2) {
                    const now = Date.now()
                    const timeSinceLast = now - lastTwoFingerTapTime
                    lastTwoFingerTapTime = now

                    if (timeSinceLast < 350) {
                        map.flyTo(
                            map.getCenter(),
                            Math.max(map.getZoom() - 1, 1),
                            {
                                duration: 0.35
                            }
                        )
                    }
                }

                maxTouchCount = 0
            }

            const container = map.getContainer()
            container.addEventListener('touchstart', handleTouchStart)
            container.addEventListener('touchend', handleTouchEnd)

            return () => {
                container.removeEventListener('touchstart', handleTouchStart)
                container.removeEventListener('touchend', handleTouchEnd)
            }
        }, [map])

        return null
    }

    function CentrarZona({
        zonas,
        zonaSeleccionadaId,
    }: {
        zonas: Zona[]
        zonaSeleccionadaId: number | null
    }) {
        const map = useMap()

        useEffect(() => {
            if (!zonaSeleccionadaId) return

            const zona = zonas.find(z => z.id === zonaSeleccionadaId)
            if (!zona) return

            let polygon: LatLngExpression[] | null = null

            if (zona.geometria) {
                polygon = getPolygonFromGeometria(zona.geometria)
            } else if (zona.coordenadas) {
                const { lat, lng } = zona.coordenadas
                const deltaLat = 0.006
                const deltaLng = 0.008

                polygon = [
                    [lat + deltaLat, lng - deltaLng * 0.4],
                    [lat + deltaLat * 0.4, lng + deltaLng],
                    [lat - deltaLat * 0.8, lng + deltaLng * 0.7],
                    [lat - deltaLat, lng - deltaLng * 0.3],
                    [lat - deltaLat * 0.2, lng - deltaLng],
                ] as LatLngExpression[]
            }

            if (!polygon) return

            map.fitBounds(polygon as [number, number][], { padding: [30, 30] })
        }, [map, zonas, zonaSeleccionadaId])

        return null
    }

    return (
        <MapContainer
            center={center}
            zoom={13}
            zoomControl={true}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
            gestureHandling={typeof window !== 'undefined' && L ? L.Browser.mobile : false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <CentrarZona zonas={zonas} zonaSeleccionadaId={zonaSeleccionadaId} />
            <DobleToque />


            {/* Dibujar TODAS las zonas en el mapa */}
            {zonas.map((zona) => {
                let polygon = null

                if (zona.geometria) {
                    polygon = getPolygonFromGeometria(zona.geometria)
                } else if (zona.coordenadas) {
                    const { lat, lng } = zona.coordenadas
                    const deltaLat = 0.006
                    const deltaLng = 0.008
                    polygon = [
                        [lat + deltaLat, lng - deltaLng * 0.4],
                        [lat + deltaLat * 0.4, lng + deltaLng],
                        [lat - deltaLat * 0.8, lng + deltaLng * 0.7],
                        [lat - deltaLat, lng - deltaLng * 0.3],
                        [lat - deltaLat * 0.2, lng - deltaLng],
                    ] as LatLngExpression[]
                }

                if (!polygon) return null

                const tienePropiedadesVisibles = zonasConPropiedades.includes(zona.id)
                const propiedadesDeEstaZona = propiedadesPorZona[zona.id] || []
                const tienePropiedades = propiedadesDeEstaZona.length > 0

                return (
                    <Polygon
                        key={`polygon-${zona.id}`}
                        positions={polygon}
                        pathOptions={{
                            color: tienePropiedadesVisibles ? "#d97706" : "#9ca3af",
                            weight: tienePropiedadesVisibles ? 2 : 1.5,
                            fillColor: tienePropiedadesVisibles ? "#f59e0b" : "#9ca3af",
                            fillOpacity: tienePropiedadesVisibles ? 0.25 : 0.1,
                        }}
                    >
                        <Popup>
                            <div className="text-sm min-w-[200px]">
                                <p className="font-semibold text-stone-800">{zona.nombre}</p>
                                <p className="text-stone-500 text-xs mt-0.5">{zona.referencia}</p>

                                {tienePropiedadesVisibles ? (
                                    <>
                                        {isLoadingPropiedades ? (
                                            <p className="text-xs text-stone-400 mt-2">Cargando propiedades...</p>
                                        ) : tienePropiedades ? (
                                            <>
                                                <p className="text-xs text-amber-600 mt-2 font-medium">
                                                    {propiedadesDeEstaZona.length} propiedad(es) encontrada(s)
                                                </p>
                                                <div className="mt-2 max-h-40 overflow-y-auto">
                                                    {propiedadesDeEstaZona.slice(0, 3).map(prop => (
                                                        <div key={prop.id} className="text-xs text-stone-600 border-t border-stone-100 mt-1 pt-1">
                                                            <p className="font-medium">{prop.titulo}</p>
                                                            <p className="text-amber-600">
                                                                {prop.tipo_accion === 'ALQUILER' ? `$${prop.precio}/mes` : `$${prop.precio}`}
                                                            </p>
                                                        </div>
                                                    ))}
                                                    {propiedadesDeEstaZona.length > 3 && (
                                                        <p className="text-xs text-stone-400 mt-1">
                                                            +{propiedadesDeEstaZona.length - 3} más...
                                                        </p>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-xs text-stone-400 mt-2">No hay propiedades en esta zona</p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-xs text-stone-400 mt-2">
                                        Activa "Mostrar propiedades" en la tarjeta para ver las propiedades dentro de esta zona.
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Polygon>
                )
            })}

            {/* Mostrar propiedades SOLO de las zonas seleccionadas */}
            {propiedades.map((prop) => {
                if (!prop.latitud || !prop.longitud) return null

                return (
                    <Marker
                        key={`prop-${prop.id}`}
                        position={[prop.latitud, prop.longitud]}
                        icon={createPropiedadIcon(prop.tipo_accion)}
                    >
                        <Popup>
                            <div className="text-sm min-w-[220px]">
                                <p className="font-semibold text-stone-800">{prop.titulo}</p>
                                <p className="font-bold text-amber-600 mt-1">
                                    {prop.tipo_accion === 'ALQUILER' ? `$${prop.precio}/mes` : `$${prop.precio}`}
                                </p>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    {prop.superficie_m2}m² | {prop.nro_cuartos || '?'} hab | {prop.nro_banos || '?'} baños
                                </p>
                                <p className="text-xs text-stone-500 mt-1">
                                    {prop.direccion}, {prop.ciudad}
                                </p>
                                <p className="text-xs text-stone-400 mt-1">
                                    Propietario: {prop.propietario}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                )
            })}
        </MapContainer>
    )
}