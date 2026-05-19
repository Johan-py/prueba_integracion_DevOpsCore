'use client'
import { Fragment, useEffect, useRef, useState } from 'react'
import { Polygon, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { ZonaPredefinida, TipoZona } from '@/types/zona'
import { ZONA_COLORS as COLORES } from '@/types/zona'

const MIN_ZOOM_LABELS = 13
const MAX_LABEL_CHARS = 32
const MAX_LABEL_CHARS_SELECTED = 50

function cerrarAnillo(coords: [number, number][]): [number, number][] {
  if (coords.length < 2) return coords

  const [firstLat, firstLng] = coords[0]
  const [lastLat, lastLng] = coords[coords.length - 1]

  if (firstLat === lastLat && firstLng === lastLng) {
    return coords
  }

  return [...coords, coords[0]]
}

function centroide(coords: [number, number][]): [number, number] {
  const ring = cerrarAnillo(coords)

  if (ring.length < 4) {
    return [
      coords.reduce((s, c) => s + c[0], 0) / coords.length,
      coords.reduce((s, c) => s + c[1], 0) / coords.length
    ]
  }

  let areaFactor = 0
  let centroidLat = 0
  let centroidLng = 0

  for (let index = 0; index < ring.length - 1; index += 1) {
    const [lat1, lng1] = ring[index]
    const [lat2, lng2] = ring[index + 1]
    const cross = lng1 * lat2 - lng2 * lat1

    areaFactor += cross
    centroidLat += (lat1 + lat2) * cross
    centroidLng += (lng1 + lng2) * cross
  }

  if (Math.abs(areaFactor) < 1e-8) {
    return [
      coords.reduce((s, c) => s + c[0], 0) / coords.length,
      coords.reduce((s, c) => s + c[1], 0) / coords.length
    ]
  }

  const area = areaFactor * 0.5

  return [centroidLat / (6 * area), centroidLng / (6 * area)]
}

function dimensionarEtiqueta(
  nombre: string,
  zoom: number,
  isSelected: boolean,
  tipoZona: TipoZona = 'predefinida'
): {
  width: number
  height: number
  fontSize: number
  lineHeight: number
  paddingX: number
  paddingY: number
  maxCharsPorLinea: number
  lineas: number
} {
  // Escala proporcional al zoom: mientras más bajo el zoom, más pequeño el scale
  // Usamos zoom directamente para un ajuste continuo
  const selectedBoost = isSelected && zoom >= MIN_ZOOM_LABELS ? 0.04 : 0
  
  // Scale proporcional: reduce continuamente conforme el zoom disminuye
  // Para zoom=13: 0.64, para zoom=18: ~1.02, para zoom<13: reduce hasta 0.36
  const zoomOffset = Math.max(-MIN_ZOOM_LABELS, zoom - MIN_ZOOM_LABELS) // Puede ser negativo
  const zoomProportional = 0.70 + (zoomOffset / 8) * 0.40 // Rango: 0.36 a ~1.02
  let scale = Math.max(0.40, Math.min(1.12, zoomProportional + selectedBoost))

   if (tipoZona === 'personalizada') {
    scale = scale * 1.2
  }

  const paddingX = Math.round((8 * scale) * 10) / 10
  const paddingY = Math.round((5 * scale) * 10) / 10

  // Calcular fontSize inicial basado en escala
  let fontSize = Math.round((12 * scale) * 10) / 10
  let lineHeight = Math.round((fontSize * 1.20) * 10) / 10

  const widthMin = Math.round(85 * scale)
  const widthMax = Math.round(150 * scale)
  
  // Ser agresivo con word wrap para AMBOS casos (seleccionada y no seleccionada)
  const factorAnchoWrap = isSelected ? 0.70 : 0.75
  const charWidthEstimado = fontSize * 0.56
  const anchoDisponible = widthMax * factorAnchoWrap - paddingX * 2 - 16
  
  // Intentar iterativamente para encontrar fontSize que funcione sin quebrar palabras
  let maxCharsPorLinea = Math.max(4, Math.floor(anchoDisponible / charWidthEstimado))
  let lineasTexto = construirLineasEtiqueta(nombre, maxCharsPorLinea)
  let largoLineaMasLarga = lineasTexto.reduce((max, linea) => Math.max(max, linea.length), 0)
  
  // Iterar para reducir fontSize si hay palabras que no caben
  let intentos = 0
  while (largoLineaMasLarga > maxCharsPorLinea && fontSize > 7 && intentos < 5) {
    fontSize = Math.max(7, Math.round((fontSize - 0.5) * 10) / 10)
    lineHeight = Math.round((fontSize * 1.20) * 10) / 10
    const newAnchoDisponible = widthMax * factorAnchoWrap - paddingX * 2 - 16
    const newCharWidth = fontSize * 0.56
    maxCharsPorLinea = Math.max(4, Math.floor(newAnchoDisponible / newCharWidth))
    lineasTexto = construirLineasEtiqueta(nombre, maxCharsPorLinea)
    largoLineaMasLarga = lineasTexto.reduce((max, linea) => Math.max(max, linea.length), 0)
    intentos++
  }
  
  const lineas = lineasTexto.length
  
  // Calcular ancho objetivo basado en el contenido
  const widthObjetivo = Math.round(largoLineaMasLarga * (fontSize * 0.56) + paddingX * 2 + 18)
  let width = Math.min(widthMax, Math.max(widthMin, widthObjetivo))
  
  // Si aún así excede, reducir fontSize más
  if (widthObjetivo > widthMax && largoLineaMasLarga > 0) {
    const espacioDisponible = widthMax - paddingX * 2 - 18
    const fontSizeAjustado = Math.max(
      7,
      (espacioDisponible / largoLineaMasLarga) * 0.85
    )
    
    if (fontSizeAjustado < fontSize) {
      fontSize = Math.round(fontSizeAjustado * 10) / 10
      lineHeight = Math.round((fontSize * 1.20) * 10) / 10
    }
  }
  
  // Recalcular width con el fontSize final
  const finalWidthObjetivo = Math.round(largoLineaMasLarga * (fontSize * 0.56) + paddingX * 2 + 18)
  width = Math.min(widthMax, Math.max(widthMin, finalWidthObjetivo))
  
  // Cuando está seleccionada con múltiples líneas, considerar reducir fontSize más
  if (isSelected && lineas > 1) {
    const totalHeightNeeded = lineas * lineHeight + paddingY * 2 + 10
    const maxHeightReasonable = Math.round(70 * scale)
    
    if (totalHeightNeeded > maxHeightReasonable) {
      const reductionFactor = Math.min(0.90, maxHeightReasonable / totalHeightNeeded)
      fontSize = Math.max(7, Math.round(fontSize * reductionFactor * 10) / 10)
      lineHeight = Math.round((fontSize * 1.20) * 10) / 10
    }
  }
  
  const height = Math.max(
    Math.round(30 * scale),
    Math.round(lineas * lineHeight + paddingY * 2 + 10)
  )

  return { width, height, fontSize, lineHeight, paddingX, paddingY, maxCharsPorLinea, lineas }
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function truncarNombreEtiqueta(nombre: string, maxChars: number): string {
  const texto = nombre.replace(/\s+/g, ' ').trim()
  if (texto.length <= maxChars) return texto

  const limite = Math.max(4, maxChars - 3)
  return `${texto.slice(0, limite).trimEnd()}...`
}

function construirLineasEtiqueta(nombre: string, maxCharsPorLinea: number): string[] {
  const texto = nombre.replace(/\s+/g, ' ').trim()
  if (!texto) return ['']

  const palabras = texto.split(' ')
  const lineas: string[] = []
  let actual = ''

  for (const palabra of palabras) {
    // Si una palabra sola excede el límite, retornarla como está
    // (el caller reducirá el fontSize si es necesario)
    if (palabra.length > maxCharsPorLinea) {
      if (actual) lineas.push(actual)
      lineas.push(palabra)
      actual = ''
      continue
    }

    const candidata = actual ? `${actual} ${palabra}` : palabra
    if (candidata.length <= maxCharsPorLinea) {
      actual = candidata
      continue
    }

    if (actual) {
      lineas.push(actual)
    }
    actual = palabra
  }

  if (actual) lineas.push(actual)
  return lineas.length ? lineas : ['']
}

function htmlEtiquetaConWrap(nombre: string, maxCharsPorLinea: number): string {
  const lineas = construirLineasEtiqueta(nombre, maxCharsPorLinea)
  return lineas.map((linea) => escaparHtml(linea)).join('<br/>')
}

function esValido(coords: unknown): coords is [number, number][] {
  if (!Array.isArray(coords) || coords.length < 3) return false
  return coords.every(
    (c) =>
      Array.isArray(c) &&
      c.length === 2 &&
      typeof c[0] === 'number' &&
      typeof c[1] === 'number' &&
      !isNaN(c[0]) &&
      !isNaN(c[1]) &&
      c[0] >= -90 &&
      c[0] <= 90 &&
      c[1] >= -180 &&
      c[1] <= 180
  )
}

// criterio 20: word-wrap; criterio 8: cursor pointer; criterio 23: tabindex + keydown→click
function labelIcon(nombre: string, isSelected: boolean, zoom: number, tipoZona: TipoZona = 'predefinida'): L.DivIcon {
  // Cuando está seleccionada, permitir más caracteres para el word wrap
  const maxChars = isSelected ? MAX_LABEL_CHARS_SELECTED * 1.3 : MAX_LABEL_CHARS
  const nombreVisible = truncarNombreEtiqueta(nombre, Math.round(maxChars))
  const {
    width,
    height,
    fontSize,
    lineHeight,
    paddingX,
    paddingY,
    maxCharsPorLinea
  } = dimensionarEtiqueta(nombreVisible, zoom, isSelected, tipoZona)
  const textoHtml = htmlEtiquetaConWrap(nombreVisible, maxCharsPorLinea)
  const nombreCompletoEscapado = escaparHtml(nombre)
  
  // Usar colores según el tipo de zona
  const colorConfig = COLORES[tipoZona]
  const color = isSelected ? colorConfig.labelColorSelected : colorConfig.labelColor
  const shadow = isSelected
    ? '0 0 4px rgba(255,255,255,0.9), 0 0 8px rgba(255,255,255,0.6)'
    : '0 1px 3px rgba(255,255,255,0.95), 0 -1px 3px rgba(255,255,255,0.95), 1px 0 3px rgba(255,255,255,0.95), -1px 0 3px rgba(255,255,255,0.95)'

  return L.divIcon({
    className: 'pb-map-label-container',
    html: `<div
      class="pb-map-label"
      aria-hidden="true"
      style="
        background: transparent;
        padding: ${paddingY}px ${paddingX}px;
        font-size: ${fontSize}px;
        line-height: ${lineHeight}px;
        font-weight: 700;
        font-family: 'Nunito', 'Quicksand', 'Inter', system-ui, sans-serif;
        color: ${color};
        letter-spacing: 0.04em;
        width: ${width}px;
        max-width: ${width}px;
        min-height: ${height}px;
        text-align: center;
        overflow: hidden;
        overflow-wrap: break-word;
        word-break: break-word;
        hyphens: auto;
        white-space: normal;
        word-spacing: -0.05em;
        cursor: pointer;
        text-shadow: ${shadow};
        outline: 2px solid transparent;
        outline-offset: 2px;
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
      ">
      <span title="${nombreCompletoEscapado}" aria-label="${nombreCompletoEscapado}" style="display:block;max-width:100%;white-space:normal;overflow-wrap:break-word;word-break:break-word;width:100%;overflow:hidden;">
        ${textoHtml}
      </span>
    </div>`,
    iconSize: [width, height],
    iconAnchor: [Math.round(width / 2), Math.round(height / 2)]
  })
}

function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    // Acceso correcto a las coordenadas
    const xi = polygon[i][0]  // latitude
    const yi = polygon[i][1]  // longitude
    const xj = polygon[j][0]  // latitude
    const yj = polygon[j][1]  // longitude
    
    const intersect = ((yi > lat) != (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)
    
    if (intersect) inside = !inside
  }
  return inside
}


function ZonaInteractiva({
  zona,
  selected,
  zoom,
  onZoneSelect,
  onZoneCycle,
}: {
  zona: ZonaPredefinida
  selected: boolean
  zoom: number
  onZoneSelect: (id: number | null) => void
  onZoneCycle?: (direction: 1 | -1) => void
}) {
  // HU10: Determinar tipo de zona (predefinida o personalizada) basado en el ID
  const tipoZona: TipoZona = zona.tipo || (zona.id < 0 ? 'personalizada' : 'predefinida')
  const colorConfig = COLORES[tipoZona]
  const polygonRef = useRef<L.Polygon | null>(null)
  const [center, setCenter] = useState<[number, number]>(() => 
    centroide(zona.coordenadas)
  )

  // Función para verificar punto dentro de polígono
  const isPointInPolygon = (lat: number, lng: number, polygon: [number, number][]): boolean => {
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0]
      const yi = polygon[i][1]
      const xj = polygon[j][0]
      const yj = polygon[j][1]
      
      const intersect = ((yi > lat) != (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)
      
      if (intersect) inside = !inside
    }
    return inside
  }

  useEffect(() => {
   // Función para recalcular el centro óptimo según el zoom
  const recalcularCentroOptimo = () => {
    const coords = zona.coordenadas
    const polygon = L.polygon(coords)
    const bounds = polygon.getBounds()
    
    // Para zoom bajo , usar centroide estándar
    if (zoom <= 13) {
      setCenter(centroide(coords))
      return
    }
    
    // Para zoom medio, usar el centro del bounding box
    if (zoom <= 15) {
      const centerLat = (bounds.getNorth() + bounds.getSouth()) / 2
      const centerLng = (bounds.getEast() + bounds.getWest()) / 2
      setCenter([centerLat, centerLng])
      return
    }
    
    // Para zoom alto - 
    // Calcular el centro promedio de todos los puntos del polígono
    let sumLat = 0
    let sumLng = 0
    let totalPuntos = 0
    
    for (let i = 0; i < coords.length; i++) {
      sumLat += coords[i][0]
      sumLng += coords[i][1]
      totalPuntos++
    }
    
    const centerLat = sumLat / totalPuntos
    const centerLng = sumLng / totalPuntos
    
    // Verificar si el punto está dentro del polígono
    if (isPointInPolygon(centerLat, centerLng, coords)) {
      setCenter([centerLat, centerLng])
    } else {
      setCenter([
        (bounds.getNorth() + bounds.getSouth()) / 2,
        (bounds.getEast() + bounds.getWest()) / 2
      ])
    }
  }
  
  recalcularCentroOptimo()
}, [zoom, zona.coordenadas])

  useEffect(() => {
    const layer = polygonRef.current
    if (!layer) return

    layer.setStyle({
      color: selected ? colorConfig.borderActive : colorConfig.borderInactive,
      weight: selected ? 2 : 1.8,
      dashArray: selected ? '6,6' : undefined,
      fillColor: selected ? colorConfig.fillActive : colorConfig.fillInactive,
      fillOpacity: selected ? colorConfig.fillOpacityActive : colorConfig.fillOpacityInactive,
      lineJoin: 'round',
      lineCap: 'round'
    })

    const element = layer.getElement() as SVGPathElement | null
    if (element) {
      element.setAttribute('aria-pressed', String(selected))
    }
  }, [selected, colorConfig.borderActive, colorConfig.borderInactive, colorConfig.fillActive, colorConfig.fillInactive, colorConfig.fillOpacityActive, colorConfig.fillOpacityInactive])



  return (
    <Fragment>
      <Polygon
        ref={polygonRef}
        positions={zona.coordenadas}
        pathOptions={{
          color: selected ? colorConfig.borderActive : colorConfig.borderInactive,
          weight: selected ? 2 : 1.8,
          dashArray: selected ? '6,6' : undefined,
          fillColor: selected ? colorConfig.fillActive : colorConfig.fillInactive,
          fillOpacity: selected ? colorConfig.fillOpacityActive : colorConfig.fillOpacityInactive,
          lineJoin: 'round',
          lineCap: 'round'
        }}
        bubblingMouseEvents={false}
        eventHandlers={{
          add: () => {
            const element = polygonRef.current?.getElement() as SVGPathElement | null
            if (!element) return

            element.setAttribute('tabindex', '0')
            element.setAttribute('role', 'button')
            element.setAttribute('aria-label', `Zona ${zona.nombre}`)
            element.setAttribute('aria-pressed', String(selected))
          },
          click: (e) => {
            L.DomEvent.stopPropagation(e)
            const element = polygonRef.current?.getElement() as SVGPathElement | null
            element?.focus({ preventScroll: true })
            onZoneSelect(selected ? null : zona.id)
          },
          mouseover: (e) => {
            const layer = e.target as L.Path
            const el = layer.getElement()

            if (el) (el as HTMLElement).style.cursor = 'pointer'

            if (!selected) {
              layer.setStyle({
                weight: 3,
                fillOpacity: 0.13
              })
            }
          },
          mouseout: (e) => {
            const layer = e.target as L.Path

            if (!selected) {
              layer.setStyle({
                weight: 1.8,
                fillOpacity: 0.10
              })
            }
          }
        }}
      />

      {zoom >= MIN_ZOOM_LABELS && (
        <Marker
          position={center}
          icon={labelIcon(zona.nombre, selected, zoom, tipoZona)}
          interactive
          keyboard={false}
          zIndexOffset={-100}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e)
              onZoneSelect(selected ? null : zona.id)
            }
          }}
        />
      )}
    </Fragment>
  )
}

interface Props {
  zonas: ZonaPredefinida[]
  selectedZoneId: number | null
  onZoneSelect: (id: number | null) => void
  onZoneCycle?: (direction: 1 | -1) => void
}

export default function ZonasOverlay({ zonas, selectedZoneId, onZoneSelect, onZoneCycle }: Props) {
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())
  useEffect(() => {
    const handler = () => setZoom(map.getZoom())
    map.on('zoomend', handler)
    return () => {
      map.off('zoomend', handler)
    }
  }, [map])

  return (
    <>
      {zonas
        .filter((z) => esValido(z.coordenadas))
        .map((zona) => {
          const sel = zona.id === selectedZoneId

          return (
            <ZonaInteractiva
              key={zona.id}
              zona={zona}
              selected={sel}
              zoom={zoom}
              onZoneSelect={onZoneSelect}
              onZoneCycle={onZoneCycle}
            />
          )
        })}
    </>
  )
}
