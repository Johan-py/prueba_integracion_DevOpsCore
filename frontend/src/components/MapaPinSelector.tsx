'use client'

import { MapContainer as BaseMapContainer, TileLayer, Marker, Polygon, CircleMarker, Tooltip, useMapEvents } from 'react-leaflet'
import { useState, useEffect } from 'react'
import L from 'leaflet'
// Importar CSS y L dinámicamente para evitar errores de SSR
if (typeof window !== 'undefined') {
  const { GestureHandling } = require('leaflet-gesture-handling');
  L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling);
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

const pinIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      position: relative;
      width: 20px;
      height: 20px;
      background: #f97316;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    ">
      <div style="
        position: absolute;
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        top: 6px;
        left: 6px;
      "></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 20]
})

const poiIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 14px;
      height: 14px;
      background: #3b82f6;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: grab;
    "></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
})

type Props = {
  pinCoords: { lat: number; lng: number } | null
  setPinCoords: (v: { lat: number; lng: number } | null) => void

  vertices: [number, number][]
  setVertices: (v: [number, number][]) => void

  modoPinActivo: boolean
  modoDifuminadoActivo: boolean
  pois: {
  id: number
  nombre: string
  lat: number
  lng: number
}[]
setPois: React.Dispatch<
  React.SetStateAction<
    {
      id: number
      nombre: string
      lat: number
      lng: number
    }[]
  >
>
poiSeleccionado: number | null
setPoiSeleccionado: (v: number | null) => void
}

function EventosMapa({
  modoPinActivo,
  modoDifuminadoActivo,
  setPinCoords,
  vertices,
  setVertices,
  setMensajeLimite,
}: any) {
  const map = useMapEvents({
    click(e) {
      if (modoPinActivo) {
        setPinCoords({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        })
      }

      if (modoDifuminadoActivo) {
        // Limitar máximo de puntos
  if (vertices.length >= 10) {
   setMensajeLimite(true)

  setTimeout(() => {
    setMensajeLimite(false)
  }, 2000)

  return
  }
  const nuevoPunto: [number, number] = [
    e.latlng.lat,
    e.latlng.lng
  ]

  if (vertices.length < 3) {
    setVertices([...vertices, nuevoPunto])
  } else {
    let mejorIndex = 0
    let menorDistancia = Infinity

    for (let i = 0; i < vertices.length; i++) {
      const actual = vertices[i]
      const siguiente = vertices[(i + 1) % vertices.length]

      const centroLat = (actual[0] + siguiente[0]) / 2
      const centroLng = (actual[1] + siguiente[1]) / 2

      const distancia = Math.sqrt(
        Math.pow(nuevoPunto[0] - centroLat, 2) +
        Math.pow(nuevoPunto[1] - centroLng, 2)
      )

      if (distancia < menorDistancia) {
        menorDistancia = distancia
        mejorIndex = i + 1
      }
    }

    const nuevosVertices = [...vertices]
    nuevosVertices.splice(mejorIndex, 0, nuevoPunto)

    setVertices(nuevosVertices)
  }
}
}
  })

  // 4 y 6. Double tap zoom + one-finger zoom
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
    if (!secondTap || e.changedTouches.length === 0) return
    
    e.preventDefault()
    e.stopPropagation()
    // Si no arrastró → doble toque normal
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

export default function MapaPinSelector({
  pinCoords,
  setPinCoords,
  vertices,
  setVertices,
  modoPinActivo,
  modoDifuminadoActivo,
  pois,
  setPois,
  poiSeleccionado,
  setPoiSeleccionado
}: Props) {
const offsets = [
  [0, -50], //arriba     
  [70, 0],  //derecha    
  [0, 40],  //abajo 
  [-70, 0], //izquierda
]
  const [mensajeLimite, setMensajeLimite] = useState(false)
 
  return (
    <div className="relative">
    <MapContainer
      center={[-17.3895, -66.1568]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: '320px', width: '100%' }}
      gestureHandling={typeof window !== 'undefined' && L ? L.Browser.mobile : false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <EventosMapa
        modoPinActivo={modoPinActivo}
        modoDifuminadoActivo={modoDifuminadoActivo}
        setPinCoords={setPinCoords}
        vertices={vertices}
        setVertices={setVertices}
        setMensajeLimite={setMensajeLimite}
      />

     {pinCoords && (
  <Marker
    position={[pinCoords.lat, pinCoords.lng]}
    icon={pinIcon}
    draggable={false}
  />
)}

{pois.map((poi, i) => (
  <Marker
    key={poi.id}
    position={[poi.lat, poi.lng]}
    icon={poiIcon}
    draggable={true}
    eventHandlers={{
      dragend: (e) => {
        const marker = e.target
        const position = marker.getLatLng()
        const nuevosPois = [...pois]
        nuevosPois[i].lat = position.lat
        nuevosPois[i].lng = position.lng
        setPois(nuevosPois)
      }
    }}
  >
    <Tooltip
      permanent
      interactive={true}
      sticky={false}
      direction="top"
      offset={[0, -5]}
      opacity={1}
      className="!bg-transparent !border-0 !shadow-none"
    >
      <input
        type="text"
        maxLength={20}
        value={poi.nombre ?? ''}
        placeholder="..."
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onFocus={() => setPoiSeleccionado(poi.id)}
        onKeyDown={(e) => e.stopPropagation()}
        onChange={(e) => {
          const nuevosPois = [...pois]
          nuevosPois[i].nombre = e.target.value
          setPois(nuevosPois)
        }}
         className={`
  px-3
  py-1
  rounded-full
  text-[11px]
  bg-white
  border
  ${poiSeleccionado === poi.id ? 'border-red-500' : 'border-gray-300'}
  shadow-sm
  min-w-[70px]
  max-w-[90px]
  outline-none
  text-center
              `}
                />
             </Tooltip>
          </Marker>
             ))}

           {vertices.length >= 3 && (
  <Polygon
    positions={vertices}
    pathOptions={{
      color: '#f97316',
      fillOpacity: 0.45
    }}
  />
          )}

          {vertices.map((p, i) => (
          <CircleMarker
            key={i}
            center={p}
            radius={5}
            pathOptions={{
              color: '#f97316',
              fillColor: '#f97316',
              fillOpacity: 1
            }}
          />
        ))}
      </MapContainer>

      {mensajeLimite && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[9999] text-orange-500 text-sm font-medium">
          Límite máximo de 10 puntos alcanzado
        </div>
      )}
    </div>
  )
}
