'use client';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ZoomControls from './ZoomControls';

const CENTER: [number, number] = [-17.3935, -66.1570];
const MIN_ZOOM = 10;
const MAX_ZOOM = 18;

export default function MapView() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const m = L.map(containerRef.current, {
      center: CENTER,
      zoom: 13,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      zoomControl: false,
      touchZoom: true,
      dragging: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(m);

    mapRef.current = m;
    setMap(m);
    return () => { m.remove(); mapRef.current = null; };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <ZoomControls map={map} minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} />
    </div>
  );
}
