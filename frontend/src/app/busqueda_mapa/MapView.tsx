"use client";

//import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import dynamic from "next/dynamic";
import L from "leaflet";
import { useEffect, useState } from "react";

import type { PropertyMapPin } from "@/types/property";

// 👇 IMPORT DINÁMICO (EVITA ERRORES SSR)
const MarkerClusterGroup = dynamic(
  () => import("react-leaflet-cluster"),
  { ssr: false }
);

// ✅ FIX ICONOS
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface MapViewProps {
  properties: PropertyMapPin[];
  center?: [number, number];
  zoom?: number;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}

export default function MapView({
  properties = [],
  center = [-17.39, -66.14],
  zoom = 12,
  onSelect,
}: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full" />;

  return (
    <div className="w-full h-full">
      <MapContainer center={center} zoom={zoom} className="w-full h-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MarkerClusterGroup>
          {properties.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              eventHandlers={{
                click: () => onSelect?.(p.id),
              }}
            >
              <Popup>
                <div>
                  <strong>{p.title}</strong>
                  <br />
                  {p.price} {p.currency}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}