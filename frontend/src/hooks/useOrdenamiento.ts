import { useState, useMemo, useCallback } from 'react'
import { Inmueble, EstadoOrdenamiento, ORDENAMIENTO_DEFAULT } from '../types/inmueble'
import { ordenarInmuebles } from '../utils/ordenarInmuebles'

interface UseOrdenamientoProps {
  /** Array de inmuebles a ordenar (puede estar pre-filtrado) */
  inmuebles: Inmueble[]
  /** Estado de ordenamiento inicial (opcional) */
  ordenInicial?: EstadoOrdenamiento
}

interface UseOrdenamientoResult {
  /** Estado actual del ordenamiento */
  ordenActual: EstadoOrdenamiento
  /** Función para actualizar el ordenamiento */
  cambiarOrden: (nuevoOrden: EstadoOrdenamiento) => void
  /** Inmuebles ordenados según los criterios actuales */
  inmueblesOrdenados: Inmueble[]
}

/**
 * Hook para manejar el ordenamiento simultáneo de inmuebles.
 *
 * Características:
 * - Soporta ordenamiento por múltiples criterios simultáneos
 * - Estado por defecto: Más recientes, Precio menor a mayor, Superficie menor a mayor
 * - Se re-aplica automáticamente cuando cambian los inmuebles filtrados
 * - Ordena en cliente sin llamadas a API
 *
 * @example
 * const { ordenActual, cambiarOrden, inmueblesOrdenados } = useOrdenamiento({
 *   inmuebles: inmueblesFiltrados
 * })
 */
export const useOrdenamiento = ({
  inmuebles,
  ordenInicial = ORDENAMIENTO_DEFAULT
}: UseOrdenamientoProps): UseOrdenamientoResult => {
  // Estado del ordenamiento actual
  const [ordenActual, setOrdenActual] = useState<EstadoOrdenamiento>(ordenInicial)

  // Callback memoizado para cambiar el orden
  const cambiarOrden = useCallback((nuevoOrden: EstadoOrdenamiento) => {
    setOrdenActual(nuevoOrden)
  }, [])

  // Ordenar inmuebles reactivamente
  // Se re-ejecuta cuando cambian los inmuebles O el estado de ordenamiento
  const inmueblesOrdenados = useMemo(() => {
    return ordenarInmuebles(inmuebles, ordenActual)
  }, [inmuebles, ordenActual])

  return {
    ordenActual,
    cambiarOrden,
    inmueblesOrdenados
  }
}
