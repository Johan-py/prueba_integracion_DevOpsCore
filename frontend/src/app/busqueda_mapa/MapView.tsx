'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { useMap } from 'react-leaflet'
import { useEffect, useState } from 'react'

import ZoomControls from '@/components/ZoomControls'
import { createGpsIcon } from '@/components/GpsPin'
import { createClusterIcon, CLUSTER_CONFIG } from '@/lib/clusterIcon'

import type { PropertyMapPin } from '@/types/property'

// Fix íconos default de Leaflet en Next.js (guard SSR)
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
  })
}

const PIN_FILL: Record<PropertyMapPin['type'], string> = {
  casa: '#3b82f6',
  departamento: '#8b5cf6',
  terreno: '#f59e0b',
  oficina: '#10b981'
}

const PIN_HALO: Record<PropertyMapPin['type'], string> = {
  casa: 'rgba(59,  130, 246, 0.25)',
  departamento: 'rgba(139, 92,  246, 0.25)',
  terreno: 'rgba(245, 158, 11,  0.25)',
  oficina: 'rgba(16,  185, 129, 0.25)'
}

// Color sólido para el texto del precio en el popup
const PIN_LABEL: Record<PropertyMapPin['type'], string> = {
  casa: '#2563eb',
  departamento: '#7c3aed',
  terreno: '#d97706',
  oficina: '#059669'
}

const SELECTED_ICONS: Record<PropertyMapPin['type'], string> = {
  casa: '/house.svg',
  departamento: '/department.svg',
  terreno: '/land.svg',
  oficina: '/office.svg'
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

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  const map = useMap()

  useEffect(() => {
    const handleClick = () => {
      onMapClick()
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
  center?: [number, number]
  zoom?: number
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  isLoading?: boolean
  error?: string | null
}

export default function MapView({
  properties = [],
  center = [-17.392418841841394, -66.1461583463333],
  zoom = 12,
  selectedId,
  onSelect,
  isLoading = false,
  error = null
}: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null)

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
        dragging={true}
        wheelDebounceTime={150}
        wheelPxPerZoomLevel={120}
        style={{ height: "100%", width: "100%" }}
        preferCanvas={true}
        bounceAtZoomLimits={false}
        inertia={true}
        inertiaDeceleration={3000}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControls />
        <MapMouseHandler onMouseLeave={() => setHoveredPinId(null)} />
        <MapClickHandler onMapClick={() => onSelect?.(null)} />
        {selectedProperty && (
          <FlyToSelected lat={selectedProperty.lat} lng={selectedProperty.lng} />
        )}

        <Marker position={center} icon={createGpsIcon()}>
          <Popup>Tu ubicación actual</Popup>
        </Marker>

        <MarkerClusterGroup
          iconCreateFunction={(cluster: any) => createClusterIcon(cluster)}
          maxClusterRadius={CLUSTER_CONFIG.maxClusterRadius}
          disableClusteringAtZoom={CLUSTER_CONFIG.disableClusteringAtZoom}
          animate={true}
          animateAddingMarkers={true}
          chunkedLoading={true}
          showCoverageOnHover={false}
          polygonOptions={{ opacity: 0 }}
          singleMarkerMode={false}
          zoomToBoundsOnClick={true}
          spiderfyOnMaxZoom={true}
          spiderfyDistanceMultiplier={2}
          removeOutsideVisibleBounds={false}
          clusterPane="markerPane"
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
                icon={icon}
                eventHandlers={{
                  click: () => onSelect?.(property.id),
                  mouseover: () => setHoveredPinId(property.id),
                  mouseout: () => setHoveredPinId(null)
                }}
              >
                <Popup>
                  <div className="text-sm min-w-[160px]">
                    <p className="font-semibold text-gray-800 mb-1">{property.title}</p>
                    <p className="font-bold" style={{ color: PIN_LABEL[property.type] }}>
                      {formatPrice(property.price, property.currency)}
                    </p>
                    <p className="text-gray-500 capitalize mt-1">{property.type}</p>
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

function FlyToSelected({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()

  useEffect(() => {
    if (!lat || !lng) return

    const targetZoom = 18

    map.flyTo([lat, lng], targetZoom, {
      duration: 1.2
    })

    const timeout = setTimeout(() => {
      map.setView([lat, lng], targetZoom)
    }, 1200)

    return () => clearTimeout(timeout)
  }, [lat, lng, map])

  return null
}
