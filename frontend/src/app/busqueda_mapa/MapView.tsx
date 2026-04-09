"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { useEffect, useState } from "react";

import ZoomControls from "@/components/ZoomControls";
import { createGpsIcon } from "@/components/GpsPin";
import { createClusterIcon, CLUSTER_CONFIG } from "@/lib/clusterIcon";

import type { PropertyMapPin } from "@/types/property";

// Fix SSR
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// 🎨 estilos
const PIN_FILL: Record<string, string> = {
  casa: "#3b82f6",
  departamento: "#8b5cf6",
  terreno: "#f59e0b",
  oficina: "#10b981",
  local: "#10b981",
};

const PIN_HALO: Record<string, string> = {
  casa: "rgba(59,130,246,0.25)",
  departamento: "rgba(139,92,246,0.25)",
  terreno: "rgba(245,158,11,0.25)",
  oficina: "rgba(16,185,129,0.25)",
  local: "rgba(16,185,129,0.25)",
};

const PIN_LABEL: Record<string, string> = {
  casa: "#2563eb",
  departamento: "#7c3aed",
  terreno: "#d97706",
  oficina: "#059669",
  local: "#059669",
};

const SELECTED_ICONS: Record<string, string> = {
  casa: "/house.svg",
  departamento: "/department.svg",
  terreno: "/land.svg",
  oficina: "/office.svg",
  local: "/local.svg",
};

// 🔵 normal pin
function createPinIcon(type: string): L.DivIcon {
  const fill = PIN_FILL[type] ?? "#6b7280";
  const halo = PIN_HALO[type] ?? "rgba(107,114,128,0.25)";
  const outer = 28;
  const inner = 20;
  const half = outer / 2;

  return L.divIcon({
    className: "",
    html: `
      <div style="width:${outer}px;height:${outer}px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:${outer}px;height:${outer}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${halo};"></div>
        <div style="position:relative;width:${inner}px;height:${inner}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${fill};border:2px solid white;"></div>
      </div>`,
    iconSize: [outer, outer],
    iconAnchor: [half, outer],
  });
}

// 🔴 seleccionado / hover
function createSelectedIcon(type: string, isHover = false): L.DivIcon {
  const scale = isHover ? 1.8 : 1.6;
  const iconPath = SELECTED_ICONS[type];

  return L.divIcon({
    className: "",
    html: `
      <div style="transform:scale(${scale});display:flex;justify-content:center;">
        <div style="width:36px;height:36px;border-radius:50%;background:#ef4444;display:flex;align-items:center;justify-content:center;border:2px solid white;">
          <img src="${iconPath}" style="width:20px;height:20px;" />
        </div>
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

// 🖱 click mapa → deseleccionar
function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  const map = useMap();
  useEffect(() => {
    map.on("click", onMapClick);
    return () => map.off("click", onMapClick);
  }, [map, onMapClick]);
  return null;
}

// 🖱 salir del mapa → quitar hover
function MapMouseHandler({ onLeave }: { onLeave: () => void }) {
  const map = useMap();
  useEffect(() => {
    map.on("mouseout", onLeave);
    return () => map.off("mouseout", onLeave);
  }, [map, onLeave]);
  return null;
}

// 🔧 fix resize
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const handler = () => map.invalidateSize();
    window.addEventListener("resize", handler);
    handler();
    return () => window.removeEventListener("resize", handler);
  }, [map]);
  return null;
}

// 🎯 fly to propiedad
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

      <MapContainer center={center} zoom={zoom} zoomControl={false} style={{ height: "100%", width: "100%" }}>
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
          animateAddingMarkers
          chunkedLoading
          showCoverageOnHover={false}
          polygonOptions={{ opacity: 0 }}
          zoomToBoundsOnClick
          spiderfyOnMaxZoom
          spiderfyDistanceMultiplier={2}
          removeOutsideVisibleBounds={false}
          clusterPane="markerPane"
          eventHandlers={{
            clusterclick: (e: any) => {
              e.layer.zoomToBounds({ padding: [20, 20] });
            },
          }}
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
                    <p className="font-semibold">{p.title}</p>
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