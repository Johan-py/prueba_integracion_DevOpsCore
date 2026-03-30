'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import ZoomControls from '@/components/ZoomControls'
import { createGpsIcon } from '@/components/GpsPin'
import { createClusterIcon, CLUSTER_CONFIG } from '@/lib/clusterIcon'
import { useProperties } from '@/hooks/useProperties'
import type { PropertyMapPin } from '@/types/property'

// Fix íconos default de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const PIN_FILL: Record<PropertyMapPin['type'], string> = {
  casa: '#3b82f6',
  departamento: '#8b5cf6',
  terreno: '#f59e0b',
  local: '#10b981'
}

const PIN_HALO: Record<PropertyMapPin['type'], string> = {
  casa: 'rgba(59,  130, 246, 0.25)',
  departamento: 'rgba(139, 92,  246, 0.25)',
  terreno: 'rgba(245, 158, 11,  0.25)',
  local: 'rgba(16,  185, 129, 0.25)'
}

// Color sólido para el texto del precio en el popup
const PIN_LABEL: Record<PropertyMapPin['type'], string> = {
  casa: '#2563eb',
  departamento: '#7c3aed',
  terreno: '#d97706',
  local: '#059669'
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

function formatPrice(price: number, currency: 'USD' | 'BOB'): string {
  return currency === 'USD'
    ? `$${price.toLocaleString('es-BO')} USD`
    : `Bs ${price.toLocaleString('es-BO')}`
}

interface MapViewProps {
  center?: [number, number]
  zoom?: number
  selectedId?: string | null
  onSelect?: (id: string) => void
}

export default function MapView({
  center = [-17.392418841841394, -66.1461583463333],
  zoom = 12,
  selectedId,
  onSelect
}: MapViewProps) {
  const { properties, isLoading, error } = useProperties()

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
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControls />

        <Marker position={center} icon={createGpsIcon()}>
          <Popup>Tu ubicación actual</Popup>
        </Marker>

        <MarkerClusterGroup
          iconCreateFunction={createClusterIcon}
          maxClusterRadius={CLUSTER_CONFIG.maxClusterRadius}
          disableClusteringAtZoom={CLUSTER_CONFIG.disableClusteringAtZoom}
          animate={true}
          animateAddingMarkers={true}
          chunkedLoading={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          removeOutsideVisibleBounds={true}
          clusterPane="markerPane"
        >
          {properties.map((property) => {
            const isSelected = property.id === selectedId

            return (
              <Marker
                key={property.id}
                position={[property.lat, property.lng]}
                icon={isSelected ? createSelectedIcon() : createPinIcon(property.type)}
                eventHandlers={{
                  click: () => onSelect?.(property.id)
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

function createSelectedIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        transform: scale(1.6);
      ">
        <div style="
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background-color: #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          border: 2px solid white;
        ">
          <img 
            src="/house.svg" 
            style="
              width:18px;
              height:18px;
              filter: brightness(0) invert(1);
            " 
          />
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34]
  })
}
