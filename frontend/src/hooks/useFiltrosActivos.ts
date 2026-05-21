// -- BitPro
// AC 9 — Deriva los filtros activos desde la URL y devuelve
// etiquetas legibles para cada uno con su función de remoción.

import { useSearchParams, useRouter } from 'next/navigation'
import { useSearchFilters } from './useSearchFilters'

export interface FiltroActivo {
  id: string
  label: string
  onRemove: () => void
}

export function useFiltrosActivos(): FiltroActivo[] {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { removeFilter } = useSearchFilters()

  const rm = (keys: string | string[]) =>
    removeFilter(router, new URLSearchParams(searchParams.toString()), keys)

  const filtros: FiltroActivo[] = []

  // ── Ubicación — muestra solo el nivel más fino seleccionado ──
  if (searchParams.has('barrioId')) {
    filtros.push({
      id: 'barrio',
      label: '📍 Barrio específico',
      onRemove: () => rm('barrioId'),
    })
  } else if (searchParams.has('zonaId')) {
    filtros.push({
      id: 'zona',
      label: '📍 Zona específica',
      onRemove: () => rm('zonaId'),
    })
  } else if (searchParams.has('municipioId')) {
    filtros.push({
      id: 'municipio',
      label: '📍 Municipio seleccionado',
      onRemove: () => rm('municipioId'),
    })
  } else if (searchParams.has('provinciaId')) {
    filtros.push({
      id: 'provincia',
      label: '📍 Provincia seleccionada',
      onRemove: () => rm('provinciaId'),
    })
  } else if (searchParams.has('departamentoId')) {
    filtros.push({
      id: 'depto',
      label: '📍 Departamento seleccionado',
      onRemove: () => rm('departamentoId'),
    })
  }

  // ── Coordenadas (cerca de mi ubicación) ──
  if (searchParams.has('lat') && searchParams.has('lng')) {
    filtros.push({
      id: 'coords',
      label: '📍 Cerca de mi ubicación',
      onRemove: () => rm(['lat', 'lng', 'radio']),
    })
  }

  // ── Precio ──
  const precioMin = searchParams.get('precioMin')
  const precioMax = searchParams.get('precioMax')
  if (precioMin || precioMax) {
    const currency = (searchParams.get('currency') || 'USD').toUpperCase()
    const sym = currency === 'BOB' ? 'Bs' : '$'
    const fmt = (v: string) =>
      Number(v).toLocaleString('es-BO', { maximumFractionDigits: 0 })
    const label =
      precioMin && precioMax
        ? `${sym}${fmt(precioMin)} – ${sym}${fmt(precioMax)}`
        : precioMin
        ? `Desde ${sym}${fmt(precioMin)}`
        : `Hasta ${sym}${fmt(precioMax!)}`
    filtros.push({
      id: 'precio',
      label,
      onRemove: () => rm(['precioMin', 'precioMax']),
    })
  }

  // ── Superficie ──
  const minSup = searchParams.get('minSuperficie')
  const maxSup = searchParams.get('maxSuperficie')
  if (minSup || maxSup) {
    const label =
      minSup && maxSup
        ? `${minSup}–${maxSup} m²`
        : minSup
        ? `Desde ${minSup} m²`
        : `Hasta ${maxSup} m²`
    filtros.push({
      id: 'superficie',
      label,
      onRemove: () => rm(['minSuperficie', 'maxSuperficie']),
    })
  }

  // ── Dormitorios ──
  const dormMin = searchParams.get('dormitoriosMin')
  const dormMax = searchParams.get('dormitoriosMax')
  if (dormMin && dormMin !== '0') {
    const label =
      dormMax && dormMax !== '0' && dormMax !== dormMin
        ? `${dormMin}–${dormMax} dorm.`
        : `${dormMin}+ dorm.`
    filtros.push({
      id: 'dormitorios',
      label,
      onRemove: () => rm(['dormitoriosMin', 'dormitoriosMax']),
    })
  }

  // ── Baños ──
  const banosMin = searchParams.get('banosMin')
  if (banosMin && banosMin !== '0') {
    filtros.push({
      id: 'banos',
      label: `${banosMin}+ baños`,
      onRemove: () => rm(['banosMin', 'banosMax', 'tipoBano']),
    })
  }

  // ── Tipo de inmueble ──
  const tipo = searchParams.get('tipo') || searchParams.get('categoria')
  if (tipo) {
    filtros.push({
      id: 'tipo',
      label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
      onRemove: () => rm(['tipo', 'categoria']),
    })
  }

  // ── Búsqueda textual ──
  const q = searchParams.get('q')
  if (q) {
    filtros.push({
      id: 'query',
      label: `"${q}"`,
      onRemove: () => rm('q'),
    })
  }

  return filtros
}