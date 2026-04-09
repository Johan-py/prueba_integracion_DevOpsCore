'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import nextDynamic from 'next/dynamic'
import {
  ChevronLeft,
  ChevronRight,
  List as ListIcon,
  LayoutGrid,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react'

import { useProperties } from '@/hooks/useProperties'
import { useOrdenamiento } from '@/hooks/useOrdenamiento'
import FilterBar from '@/components/filters/FilterBar'
import PropertyCard from '@/components/layout/PropertyCard'
import PropertyRow from '@/components/galeria/PropertyRow'
import EmptyState from '@/components/galeria/EmptyState'
import { MenuOrdenamiento } from '@/components/busqueda/ordenamiento/MenuOrdenamiento'

const MapView = nextDynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-stone-100 animate-pulse flex items-center justify-center text-stone-400">
      Cargando mapa de Bolivia...
    </div>
  )
})

function useIsMobile(breakpoint = 768) {
  // Siempre false en el primer render (igual que SSR) para evitar hydration mismatch
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    setIsMobile(mql.matches) // actualiza solo en cliente post-mount
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}

function MapMouseHandler({ onLeave }: { onLeave: () => void }) {
  const map = useMap();
  useEffect(() => {
    map.on("mouseout", onLeave);
    return () => map.off("mouseout", onLeave);
  }, [map, onLeave]);
  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const handler = () => map.invalidateSize({ animate: false });
    window.addEventListener("resize", handler);
    handler();
    return () => window.removeEventListener("resize", handler);
  }, [map]);
  return null;
}

function FlyToSelected({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    if (!lat || !lng) return;
    const zoom = 18;
    map.flyTo([lat, lng], zoom, { duration: 1.2 });

    const t = setTimeout(() => {
      map.setView([lat, lng], zoom);
    }, 1200);

    return () => clearTimeout(t);
  }, [lat, lng, map]);

  return null;
}

function formatPrice(price: number, currency: "USD" | "BOB") {
  return currency === "USD"
    ? `$${price.toLocaleString("es-BO")} USD`
    : `Bs ${price.toLocaleString("es-BO")}`;
}

interface MapViewProps {
  properties: PropertyMapPin[];
  center?: [number, number];
  zoom?: number;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  error?: string | null;
}

export default function MapView({
  properties = [],
  center = [-17.39, -66.15],
  zoom = 12,
  selectedId,
  onSelect,
  error,
}: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return <div className="w-full h-full bg-gray-100" />;

  const selected = properties.find((p) => p.id === selectedId);

  return (
    <div className="relative w-full h-full">
      {error && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-red-100 px-3 py-1 rounded">
          {error}
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MapResizer />
        <ZoomControls />

        <MapClickHandler onMapClick={() => onSelect?.(null)} />
        <MapMouseHandler onLeave={() => setHoveredPinId(null)} />

        {selected && <FlyToSelected lat={selected.lat} lng={selected.lng} />}

        <Marker position={center} icon={createGpsIcon()}>
          <Popup>Tu ubicación</Popup>
        </Marker>

        <MarkerClusterGroup
          iconCreateFunction={(c) => createClusterIcon(c)}
          maxClusterRadius={CLUSTER_CONFIG.maxClusterRadius}
          disableClusteringAtZoom={CLUSTER_CONFIG.disableClusteringAtZoom}
          animate
          chunkedLoading
          showCoverageOnHover={false}
          zoomToBoundsOnClick
        >
          {properties.map((p) => {
            const isSelected = p.id === selectedId;
            const isHover = p.id === hoveredPinId;

            let icon = createPinIcon(p.type);
            if (isSelected) icon = createSelectedIcon(p.type);
            else if (isHover) icon = createSelectedIcon(p.type, true);

            return (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => onSelect?.(p.id),
                  mouseover: () => setHoveredPinId(p.id),
                  mouseout: () => setHoveredPinId(null),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p>{p.title}</p>
                    <p style={{ color: PIN_LABEL[p.type] }}>
                      {formatPrice(p.price, p.currency)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}