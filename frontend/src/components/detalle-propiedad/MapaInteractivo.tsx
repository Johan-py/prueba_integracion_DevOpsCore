'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { PuntoInteres } from '@/types/detallePropiedad'

// 1. Definimos el SVG del pin principal
const pinPrincipalSvg = `
  <svg width="100%" height="100%" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 0C8.059 0 0 8.059 0 18C0 31.5 18 46 18 46C18 46 36 31.5 36 18C36 8.059 27.941 0 18 0Z" fill="#E68B25"/>
    <circle cx="18" cy="18" r="8" fill="white"/>
  </svg>
`;

// 2. Definimos el SVG para los Puntos de Interés (POI) 
const pinPoiSvg = `
  <svg width="100%" height="100%" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 0C8.059 0 0 8.059 0 18C0 31.5 18 46 18 46C18 46 36 31.5 36 18C36 8.059 27.941 0 18 0Z" fill="#5f5a54"/>
    <circle cx="18" cy="18" r="6" fill="white"/>
  </svg>
`;

// 3. Configuración de L.divIcon
const customIcon = L.divIcon({
  html: pinPrincipalSvg,
  // El ! asegura que sobreescriba cualquier estilo de modo oscuro global
  className: '!bg-transparent !border-none !shadow-none !outline-none flex justify-center items-center', 
  iconSize: [36, 46],
  iconAnchor: [18, 46],
  popupAnchor: [0, -40]
});

const poiIcon = L.divIcon({
  html: pinPoiSvg,
  className: '!bg-transparent !border-none !shadow-none !outline-none flex justify-center items-center',
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -30]
});

interface MapaProps {
  latitud: number;
  longitud: number;
  puntosDeInteres?: PuntoInteres[];
}

export default function MapaInteractivo({ latitud, longitud, puntosDeInteres = [] }: MapaProps) {
  const posicionCentral: [number, number] = [latitud, longitud]

  return (
    <MapContainer 
        center={posicionCentral} 
        zoom={15} 
        // Clases para controlar los botones de zoom en modo oscuro
        className="h-full w-full z-0 
            [&_.leaflet-control-zoom-in]:dark:!bg-[#2c2824] [&_.leaflet-control-zoom-in]:dark:!text-[#ede7dc] 
            [&_.leaflet-control-zoom-out]:dark:!bg-[#2c2824] [&_.leaflet-control-zoom-out]:dark:!text-[#ede7dc] 
            [&_.leaflet-control-zoom-in]:!border-[#5f5a54] [&_.leaflet-control-zoom-out]:!border-[#5f5a54]
            [&_.leaflet-bar]:!border-none"
        style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Marcador Principal del Inmueble */}
      <Marker position={posicionCentral} icon={customIcon}>
        <Popup>Ubicación del inmueble</Popup>
      </Marker>

      {/* Marcadores de los Puntos de Interés (POI) */}
      {puntosDeInteres.map((poi) => (
        <Marker 
          key={poi.id} 
          position={[poi.latitud, poi.longitud]} 
          icon={poiIcon}
        >
          <Popup>{poi.nombre}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}