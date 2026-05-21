import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PropertyMapPin } from '../types/property'
import { EstadoOrdenamiento, ORDENAMIENTO_DEFAULT } from '../types/inmueble'

const STORAGE_KEY = 'propbol:ordenamiento'

function cargarOrdenGuardado(): EstadoOrdenamiento {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return ORDENAMIENTO_DEFAULT
    return JSON.parse(raw) as EstadoOrdenamiento
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
  inmuebles: PropertyMapPin[]
  ordenInicial?: EstadoOrdenamiento
}

interface UseOrdenamientoResult {
  ordenActual: EstadoOrdenamiento
  cambiarOrden: (nuevoOrden: EstadoOrdenamiento) => void
  inmueblesOrdenados: PropertyMapPin[]
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
  const router = useRouter()
  const searchParams = useSearchParams()

  const [ordenActual, setOrdenActual] = useState<EstadoOrdenamiento>(
    ordenInicial ?? ORDENAMIENTO_DEFAULT
  )

  useEffect(() => {
    if (!ordenInicial) {
      const saved = cargarOrdenGuardado()
      if (saved.criterioActivo !== null) {
        setOrdenActual(saved)
      }
    }
  }, [])

  useEffect(() => {
    guardarOrden(ordenActual)
  }, [ordenActual])

  const cambiarOrden = useCallback(
    (nuevoOrden: EstadoOrdenamiento) => {
      setOrdenActual(nuevoOrden)
      // Sincronización con la URL para que el Backend ordene
      const params = new URLSearchParams(searchParams.toString())

      params.delete('precio')
      params.delete('superficie')
      params.delete('fecha')

      if (nuevoOrden.criterioActivo === 'precio') {
        params.set('precio', nuevoOrden.precio)
      } else if (nuevoOrden.criterioActivo === 'superficie') {
        params.set('superficie', nuevoOrden.superficie)
      } else if (
        nuevoOrden.criterioActivo === 'fecha' ||
        nuevoOrden.criterioActivo === 'recomendados'
      ) {
        params.set('fecha', nuevoOrden.fecha)
      }

      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  return {
    ordenActual,
    cambiarOrden,
    inmueblesOrdenados: inmuebles // Prisma ya los devuelve ordenados
  }
}
