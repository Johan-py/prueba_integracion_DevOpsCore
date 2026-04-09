'use client'

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
    // sin persistencia si localStorage falla
  }
}

interface UseOrdenamientoProps {
  inmuebles: PropertyMapPin[]
  ordenInicial?: EstadoOrdenamiento
}

interface UseOrdenamientoResult {
  ordenActual: EstadoOrdenamiento
  cambiarOrden: (nuevoOrden: EstadoOrdenamiento) => void
  inmueblesOrdenados: PropertyMapPin[]
}

export const useOrdenamiento = ({
  inmuebles,
  ordenInicial
}: UseOrdenamientoProps): UseOrdenamientoResult => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [ordenActual, setOrdenActual] = useState<EstadoOrdenamiento>(
    ordenInicial ?? ORDENAMIENTO_DEFAULT
  )

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    const ordenGuardado = cargarOrdenGuardado()
    setOrdenActual(ordenInicial ?? ordenGuardado)
    setHydrated(true)
  }, [ordenInicial])

  useEffect(() => {
    if (!hydrated) return
    guardarOrden(ordenActual)
  }, [ordenActual, hydrated])

  const cambiarOrden = useCallback(
    (nuevoOrden: EstadoOrdenamiento) => {
      setOrdenActual(nuevoOrden)

      const params = new URLSearchParams(searchParams.toString())
      params.delete('precio')
      params.delete('superficie')
      params.delete('fecha')

      if (nuevoOrden.criterioActivo === 'precio') {
        params.set('precio', nuevoOrden.precio)
      } else if (nuevoOrden.criterioActivo === 'superficie') {
        params.set('superficie', nuevoOrden.superficie)
      } else if (nuevoOrden.criterioActivo === 'fecha') {
        params.set('fecha', nuevoOrden.fecha)
      }

      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  return {
    ordenActual,
    cambiarOrden,
    inmueblesOrdenados: inmuebles
  }
}
