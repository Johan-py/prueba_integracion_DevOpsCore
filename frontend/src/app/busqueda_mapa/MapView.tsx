'use client'

import {
  MapContainer as BaseMapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  CircleMarker,
  Circle
} from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { useMap } from 'react-leaflet'
import { useEffect, useState, useRef } from 'react'

import ZoomControls from '@/components/ZoomControls'
import { createGpsIcon, createSearchOriginIcon } from '@/components/GpsPin'
import { createClusterIcon, CLUSTER_CONFIG } from '@/lib/clusterIcon'
import ZonasOverlay from '@/components/map/ZonasOverlay'

import type { PropertyMapPin } from '@/types/property'
import type { ZonaPredefinida } from '@/types/zona'

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

// Fix íconos default de Leaflet en Next.js (guard SSR)
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
  })
  //Agregamos el plugin de gesture handling para moviles MAPAS HU11
  const { GestureHandling } = require('leaflet-gesture-handling')
  L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling)
}

const PIN_FILL: Record<PropertyMapPin['type'], string> = {
  casa: '#3b82f6',
  departamento: '#8b5cf6',
  terreno: '#f59e0b',
  oficina: '#10b981',
  cuarto: '#ec4899',
  cementerio: '#64748b',
  espacios: '#06b6d4'
}

const PIN_HALO: Record<PropertyMapPin['type'], string> = {
  casa: 'rgba(59,  130, 246, 0.25)',
  departamento: 'rgba(139, 92,  246, 0.25)',
  terreno: 'rgba(245, 158, 11,  0.25)',
  oficina: 'rgba(16,  185, 129, 0.25)',
  cuarto: 'rgba(236, 72,  153, 0.25)',
  cementerio: 'rgba(100, 116, 139, 0.25)',
  espacios: 'rgba(6,   182, 212, 0.25)'
}

// Color sólido para el texto del precio en el popup
const PIN_LABEL: Record<PropertyMapPin['type'], string> = {
  casa: '#2563eb',
  departamento: '#7c3aed',
  terreno: '#d97706',
  oficina: '#059669',
  cuarto: '#db2777',
  cementerio: '#475569',
  espacios: '#0891b2'
}

const SELECTED_ICONS: Record<PropertyMapPin['type'], string> = {
  casa: '/house.svg',
  departamento: '/department.svg',
  terreno: '/land.svg',
  oficina: '/office.svg',
  cuarto: '/house.svg',
  cementerio: '/land.svg',
  espacios: '/office.svg'
}

function createPinIcon(type: PropertyMapPin['type']): L.DivIcon {
  const fill = PIN_FILL[type] ?? '#6b7280'
  const halo = PIN_HALO[type] ?? 'rgba(107,114,128,0.25)'

  const outer = 28
  const inner = 20
  const half = outer / 2

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: ${outer}px;
        height: ${outer}px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <!-- Halo -->
        <div style="
          position: absolute;
          width: ${outer}px;
          height: ${outer}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background-color: ${halo};
        "></div>
        <!-- Gota sólida -->
        <div style="
          position: relative;
          width: ${inner}px;
          height: ${inner}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background-color: ${fill};
          border: 2px solid rgba(255,255,255,0.9);
          box-shadow: 0 1px 4px rgba(0,0,0,0.20);
        "></div>
      </div>
    `,
    iconSize: [outer, outer],
    iconAnchor: [half, outer],
    popupAnchor: [0, -outer]
  })
}

function MapClickHandler({ onMapClick, isDrawingMode }: {
  onMapClick: (latlng: L.LatLng) => void
  isDrawingMode: boolean
}) {
  const map = useMap()
  
  // AÑADIDO: Control nativo del cursor y bloqueo de arrastre (Criterios 2 y 20)
  useEffect(() => {
    if (isDrawingMode) {
      map.dragging.disable()
      map.getContainer().style.cursor = 'crosshair'
    } else {
      map.dragging.enable()
      map.getContainer().style.cursor = ''
    }
  }, [isDrawingMode, map])

// 4 y 6. Double tap zoom + one finger zoom
useEffect(() => {
  const DOUBLE_TAP_DELAY = 300
  const DRAG_THRESHOLD = 10

  let lastTapTime = 0

  let secondTap = false
  let isDraggingZoom = false

  let startY = 0
  let startZoom = 0

  let touchStartTime = 0

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

      // FIX: Detener la propagación al motor de scroll del navegador desde el momento exacto en que se registra el segundo tap.
      if (e.cancelable) {
        e.preventDefault()
      }
    } else {
      // Limpiar estados residuales si pasó mucho tiempo
      secondTap = false
      isDraggingZoom = false
    }

    lastTapTime = now
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!secondTap) return

    // FIX: Bloquear el scroll de la página de forma incondicional en cada frame de movimiento mientras estemos en el segundo tap.
    if (e.cancelable) {
      e.preventDefault()
    }

    const currentY = e.touches[0].clientY
    const deltaY = startY - currentY

    // Activar modo drag zoom
    if (Math.abs(deltaY) > DRAG_THRESHOLD) {
      isDraggingZoom = true

      const zoomDelta = deltaY / 80

      map.setZoom(startZoom + zoomDelta, {
        animate: false
      })
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (!secondTap) return

    // Si NO hubo arrastre => doble toque normal
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
      // Registramos el máximo de dedos usados en este gesto
      if (e.touches.length > maxTouchCount) {
        maxTouchCount = e.touches.length
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      // Solo procesamos cuando se levantan TODOS los dedos
      if (e.touches.length !== 0) return

      // Verificamos que en algún momento hubo 2 dedos
      if (maxTouchCount === 2) {
        const now = Date.now()
        const timeSinceLast = now - lastTwoFingerTapTime
        lastTwoFingerTapTime = now

        if (timeSinceLast < 350) {
  const center = map.getCenter()

  map.flyTo(
    center,
    Math.max(map.getZoom() - 1, 1),
    {
      duration: 0.35
    }
  )
}
      }

      // Reiniciamos el contador para el próximo gesto
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

useEffect(() => {
  const handleClick = (e: L.LeafletMouseEvent) => {
    onMapClick(e.latlng)
  }

  map.on('click', handleClick)

  return () => {
    map.off('click', handleClick)
  }
}, [map, onMapClick])

return null
}

function MapMouseHandler({ onMouseLeave }: { onMouseLeave: () => void }) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const handleMouseOut = () => {
      onMouseLeave()
    }

    map.on('mouseout', handleMouseOut)

    return () => {
      map.off('mouseout', handleMouseOut)
    }
  }, [map, onMouseLeave])

  return null
}

function createSelectedIcon(type: PropertyMapPin['type'], isHover: boolean = false): L.DivIcon {
  const iconPath = SELECTED_ICONS[type]
  const scale = isHover ? 1.8 : 1.6
  const shadowIntensity = isHover ? '0 6px 16px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.35)'

  return L.divIcon({
    className: '',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        transform: scale(${scale});
        transition: all 0.15s ease;
      ">
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: ${shadowIntensity};
          border: 2px solid white;
        ">
          <img 
            src="${iconPath}" 
            style="
              width:20px;
              height:20px;
              object-fit: contain;
              display: block;
            " 
          />
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  })
}

function formatPrice(price: number, currency: 'USD' | 'BOB'): string {
  return currency === 'USD'
    ? `$${price.toLocaleString('es-BO')} USD`
    : `Bs ${price.toLocaleString('es-BO')}`
}

interface MapViewProps {
  properties: PropertyMapPin[]
  searchOrigin?: [number, number] | null
  zonas?: ZonaPredefinida[]
  selectedZoneId?: number | null
  onZoneSelect?: (id: number | null) => void
  onZoneCycle?: (direction: 1 | -1) => void
  selectedDrawnPolygonIndex?: number | null
  onDrawnPolygonSelect?: (index: number | null) => void
  center?: [number, number]
  zoom?: number
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  onClusterClick?: (properties: PropertyMapPin[]) => void
  activeClusterIds?: string[]
  isDrawingMode?: boolean
   polygonPoints?: [number, number][]
  isPolygonClosed?: boolean
  drawnPolygons?: [number, number][][]
  isZoneEditingMode?: boolean
  editablePolygonPoints?: [number, number][]
  onEditablePointDrag?: (index: number, lat: number, lng: number) => void
  onMapClick?: (latlng: L.LatLng) => void
  onPointClick?: (index: number) => void
  isLoading?: boolean
  error?: string | null
  onClusterDissolve?: () => void
}

const vertexHandleIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 12px;
      height: 12px;
      border-radius: 9999px;
      background: #ffffff;
      border: 2px solid #16a34a;
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
    "></div>
  `,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
})
function ZoomHandler({ onClusterDissolve }: { onClusterDissolve?: () => void }) {
  const map = useMap()
  useEffect(() => {
    const handler = () => onClusterDissolve?.()
    map.on('zoomend', handler)
    return () => { map.off('zoomend', handler) }
  }, [map, onClusterDissolve])
  return null
}

export default function MapView({
  properties = [],
  searchOrigin = null,
  center = [-17.392418841841394, -66.1461583463333],
  zoom = 12,
  selectedId,
  onSelect,
  onClusterClick,
  activeClusterIds = [],
  isLoading = false,
  error = null,
  isDrawingMode = false,
  polygonPoints = [],
  isPolygonClosed = false,
  drawnPolygons = [],
  isZoneEditingMode = false,
  editablePolygonPoints = [],
  onEditablePointDrag,
  onMapClick,
  onPointClick,
  zonas = [],
  selectedZoneId = null,
  onClusterDissolve,
  onZoneSelect,
  onZoneCycle,
  selectedDrawnPolygonIndex = null,
  onDrawnPolygonSelect
}: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null)
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({})

  useEffect(() => {
    // Cerrar popup del marker anterior
    Object.entries(markerRefs.current).forEach(([id, marker]) => {
      if (marker && id !== hoveredPinId && marker.isPopupOpen()) {
        marker.closePopup()
      }
    })

    // Abrir popup del marker en hover
    if (hoveredPinId && markerRefs.current[hoveredPinId]) {
      markerRefs.current[hoveredPinId]?.openPopup()
    }
  }, [hoveredPinId])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Evita hydration mismatch: renderiza skeleton hasta que el cliente monte
  if (!isMounted) return <div className="w-full h-full bg-gray-100 animate-pulse" />

  const selectedProperty = properties.find((p) => p.id === selectedId)

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow text-sm text-gray-600 flex items-center gap-2 pointer-events-none">
          <span className="animate-spin inline-block w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full" />
          Cargando propiedades...
        </div>
      )}

      {error && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-red-50 border border-red-200 px-4 py-2 rounded-full shadow text-sm text-red-600 pointer-events-none">
          ⚠️ {error}
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        touchZoom={true}
        doubleClickZoom={true}
        dragging={true}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className={`z-0 ${isDrawingMode && !isPolygonClosed ? '[&.leaflet-container]:cursor-crosshair [&_.leaflet-interactive]:cursor-crosshair' : ''}`}
        gestureHandling={typeof window !== 'undefined' && L ? L.Browser.mobile : false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControls />
        <FlyToOrigin origin={searchOrigin} />
        <ZoomHandler onClusterDissolve={onClusterDissolve} />
        <MapMouseHandler onMouseLeave={() => setHoveredPinId(null)} />
        <MapClickHandler
          onMapClick={(latlng) => {
            if (isDrawingMode && onMapClick) {
              onMapClick(latlng)
            } else if (!isDrawingMode && !isZoneEditingMode) {
              onSelect?.(null)
              onZoneSelect?.(null) // criterio 10: clic neutral desactiva zona
            }
          }}
          isDrawingMode={isDrawingMode}
        />

        <ZonasOverlay
          zonas={zonas}
          selectedZoneId={selectedZoneId}
          onZoneSelect={onZoneSelect ?? (() => {})}
          onZoneCycle={onZoneCycle}
        />

        {/* --- INICIO CÓDIGO HU8 --- */}
        {polygonPoints && polygonPoints.length > 0 && !isPolygonClosed && (
          <>
            <Polyline
              positions={polygonPoints}
              pathOptions={{ color: '#16a34a', weight: 3, dashArray: '5, 10' }}
            />
            {polygonPoints.map((pt, index) => (
              <CircleMarker
                key={index}
                center={pt}
                radius={5}
                pathOptions={{
                  color: '#16a34a',
                  fillColor: 'white',
                  fillOpacity: 1
                }}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e)
                    if (onPointClick) onPointClick(index)
                  }
                }}
              />
            ))}
          </>
        )}

        {isPolygonClosed && polygonPoints && polygonPoints.length >= 3 && (
          <Polygon
            positions={polygonPoints}
            pathOptions={{
              color: '#16a34a',
              fillColor: '#22c55e',
              fillOpacity: 0.25,
              weight: 2
            }}
          />
        )}

        {isZoneEditingMode && editablePolygonPoints.length >= 3 && (
          <>
            <Polygon
              positions={editablePolygonPoints}
              pathOptions={{
                color: '#16a34a',
                fillColor: '#22c55e',
                fillOpacity: 0.25,
                weight: 2,
                dashArray: '6, 6'
              }}
            />
            {editablePolygonPoints.map((point, index) => (
              <Marker
                key={`editable-point-${index}`}
                position={point}
                draggable
                icon={vertexHandleIcon}
                eventHandlers={{
                  dragend: (event) => {
                    const latlng = event.target.getLatLng()
                    onEditablePointDrag?.(index, latlng.lat, latlng.lng)
                  }
                }}
              />
            ))}
          </>
        )}
        {/* --- FIN CÓDIGO HU8 --- */}
        {/* --- POLÍGONOS CERRADOS ACUMULADOS --- */}
        {drawnPolygons.map((poly, i) => (
          <Polygon
            key={`drawn-${i}`}
            positions={poly}
            pathOptions={{
              color: '#16a34a',
              fillColor: '#22c55e',
              fillOpacity: selectedDrawnPolygonIndex === i ? 0.14 : 0.2,
              weight: selectedDrawnPolygonIndex === i ? 2.5 : 2,
              dashArray: selectedDrawnPolygonIndex === i ? '6,6' : undefined
            }}
            bubblingMouseEvents={false}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e)
                onZoneSelect?.(null)
                onDrawnPolygonSelect?.(selectedDrawnPolygonIndex === i ? null : i)
              }
            }}
          />
        ))}
        {/* --- FIN CÓDIGO HU8 --- */}
        
        {selectedProperty && (
          <FlyToSelected
            id={selectedProperty.id}
            lat={selectedProperty.lat}
            lng={selectedProperty.lng}
          />
        )}

        <Marker position={center} icon={createGpsIcon()}>
          <Popup><span className="pb-map-popup-dark-fix" style={{ '--popup-light-color': '#1f2937', '--popup-dark-color': '#f3f4f6' } as React.CSSProperties}>Tu ubicación actual</span></Popup>
        </Marker>

        {/* NUEVO: Marcador de Origen y Círculo de Radio */}
        {searchOrigin && (
          <>
            <Circle 
              center={searchOrigin} 
              radius={1000} // 1000 metros = 1km
              pathOptions={{ color: '#2563EB', fillColor: '#3B82F6', fillOpacity: 0.12, weight: 2, dashArray: '5, 5' }} 
            />
            <Marker position={searchOrigin} icon={createSearchOriginIcon()} zIndexOffset={1000}>
              <Popup>
                <div className="text-center min-w-[120px] pb-map-popup-dark-fix">
                  <p className="font-bold mb-1" style={{ '--popup-light-color': '#2563EB', '--popup-dark-color': '#60a5fa' } as React.CSSProperties}>Centro de búsqueda</p>
                  <p className="text-xs" style={{ '--popup-light-color': '#78716c', '--popup-dark-color': '#a8a29e' } as React.CSSProperties}>Mostrando radio de 1km</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        <MarkerClusterGroup
          key={activeClusterIds.join(',')}
          iconCreateFunction={(cluster: any) => {
            const markers = cluster.getAllChildMarkers()
            const ids = markers.map((m: any) => String(m.options.alt ?? '')).filter(Boolean)
            const isActive = ids.some((id: string) => activeClusterIds.includes(id))
            return createClusterIcon(cluster, isActive)
          }}
          maxClusterRadius={CLUSTER_CONFIG.maxClusterRadius}
          disableClusteringAtZoom={CLUSTER_CONFIG.disableClusteringAtZoom}
          animate={false}
          preferCanvas={true}
          animateAddingMarkers={false}
          chunkedLoading={true}
          tap={true}
          tapTolerance={15}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={false}
          spiderfyOnMaxZoom={false}
          spiderfyDistanceMultiplier={2}
          removeOutsideVisibleBounds={false}
          clusterPane="markerPane"
          eventHandlers={{
            clusterclick: (cluster: any) => {
              const markers = cluster.layer.getAllChildMarkers()
              const ids = markers.map((m: any) => m.options.alt).filter(Boolean)
              const props = properties.filter((p) => ids.includes(p.id))
              onClusterClick?.(props)
            }
          }}
        >
          {properties.map((property) => {
            const isSelected = property.id === selectedId
            const isHovered = property.id === hoveredPinId

            // Prioridad: selected > hovered > normal
            let icon
            if (isSelected) {
              icon = createSelectedIcon(property.type, false)
            } else if (isHovered) {
              icon = createSelectedIcon(property.type, true) // Hover usa mismo estilo pero más grande
            } else {
              icon = createPinIcon(property.type)
            }
            return (
              <Marker
                key={property.id}
                position={[property.lat, property.lng]}
                alt={property.id}
                icon={icon}
                ref={(el) => {
                  if (el) markerRefs.current[property.id] = el
                }}
                eventHandlers={{
                  click: () => onSelect?.(property.id),
                  mouseover: () => setHoveredPinId(property.id),
                  mouseout: () => setHoveredPinId(null)
                }}
              >
                <Popup>
                  <div className="text-sm min-w-[160px] pb-map-popup-dark-fix">
                    <p className="font-semibold mb-1" style={{ '--popup-light-color': '#1f2937', '--popup-dark-color': '#f3f4f6' } as React.CSSProperties}>{property.title}</p>
                    <p className="font-bold" style={{ '--popup-light-color': PIN_LABEL[property.type], '--popup-dark-color': property.type === 'casa' ? '#60a5fa' : '#a78bfa' } as React.CSSProperties}>
                      {formatPrice(property.price, property.currency)}
                    </p>
                    <p className="capitalize mt-1" style={{ '--popup-light-color': '#6b7280', '--popup-dark-color': '#9ca3af' } as React.CSSProperties}>{property.type}</p>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}

function FlyToSelected({ lat, lng, id }: { lat: number; lng: number; id: string }) {
  const map = useMap()
  const [lastId, setLastId] = useState<string | null>(null)

  useEffect(() => {
    if (!lat || !lng || lastId === id) return

    const currentCenter = map.getCenter()
    const distance = currentCenter.distanceTo([lat, lng])

    const targetZoom = 16
    const isFar = distance > 1000

    if (isFar) {
      map.flyTo([lat, lng], targetZoom, {
        duration: 0.8,
        easeLinearity: 0.25
      })
    } else {
      map.setView([lat, lng], targetZoom)
    }

    setLastId(id)
  }, [lat, lng, id, map, lastId])

  return null
}
// NUEVO: Componente para volar al punto de búsqueda
function FlyToOrigin({ origin }: { origin: [number, number] | null }) {
  const map = useMap()
  
  // Extraemos las coordenadas como números primitivos para el array de dependencias
  const lat = origin?.[0]
  const lng = origin?.[1]

  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      // Solo volamos si la latitud o longitud REALMENTE cambian en la URL
      map.flyTo([lat, lng], 15, { duration: 1.2, easeLinearity: 0.25 })
    }
  }, [lat, lng, map]) 

  return null
}
