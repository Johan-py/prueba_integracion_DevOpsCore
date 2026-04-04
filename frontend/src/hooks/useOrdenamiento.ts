import { useState, useMemo, useCallback, useEffect } from 'react'
import { Inmueble, EstadoOrdenamiento, ORDENAMIENTO_DEFAULT } from '../types/inmueble'
import { ordenarInmuebles } from '../utils/ordenarInmuebles'

const STORAGE_KEY = 'propbol:ordenamiento'

function cargarOrdenGuardado(): EstadoOrdenamiento {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return ORDENAMIENTO_DEFAULT

    const parsed = JSON.parse(raw) as EstadoOrdenamiento

    const criteriosValidos = [null, 'fecha', 'precio', 'superficie']
    if (!criteriosValidos.includes(parsed.criterioActivo)) return ORDENAMIENTO_DEFAULT

    return parsed
  } catch {
    return ORDENAMIENTO_DEFAULT
  }
}

function guardarOrden(orden: EstadoOrdenamiento): void {
  try {
    if (orden.criterioActivo === null) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orden))
    }
  } catch {
    // localStorage puede estar bloqueado (modo privado estricto, Safari, etc.)
    // Fallamos silenciosamente — la app sigue funcionando sin persistencia.
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseOrdenamientoProps {
  inmuebles: Inmueble[]
  ordenInicial?: EstadoOrdenamiento
}

interface UseOrdenamientoResult {
  ordenActual: EstadoOrdenamiento
  cambiarOrden: (nuevoOrden: EstadoOrdenamiento) => void
  inmueblesOrdenados: Inmueble[]
}

/**
 * Hook para manejar el ordenamiento de inmuebles con persistencia.
 *
 * Comportamiento:
 * - Primera visita o sin criterio guardado → ordena por fecha más recientes (default)
 * - Si el usuario eligió un criterio antes → lo recupera al refrescar
 * - Si el usuario limpia el ordenamiento → borra la preferencia guardada
 * - Falla silenciosamente si localStorage no está disponible
 */
export const useOrdenamiento = ({
  inmuebles,
  ordenInicial
}: UseOrdenamientoProps): UseOrdenamientoResult => {
  const [ordenActual, setOrdenActual] = useState<EstadoOrdenamiento>(() => {
    // Prioridad: ordenInicial (si se pasó explícitamente) → localStorage → default
    return ordenInicial ?? cargarOrdenGuardado()
  })

  // Persistir cada vez que el orden cambia
  useEffect(() => {
    guardarOrden(ordenActual)
  }, [ordenActual])

  const cambiarOrden = useCallback((nuevoOrden: EstadoOrdenamiento) => {
    setOrdenActual(nuevoOrden)
  }, [])

  const inmueblesOrdenados = useMemo(() => {
    return ordenarInmuebles(inmuebles, ordenActual)
  }, [inmuebles, ordenActual])

  return { ordenActual, cambiarOrden, inmueblesOrdenados }
}
