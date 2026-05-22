'use client'

import { useEffect, useState } from 'react'
import { obtenerDetallePropiedad } from '@/services/detallePropiedad.service'
import type { DetallePropiedad } from '@/types/detallePropiedad'

export function useDetallePropiedad(id: number) {
  const [detalle, setDetalle] = useState<DetallePropiedad | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await obtenerDetallePropiedad(id)
        setDetalle(data)
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'No se pudo cargar el detalle'
        setError(mensaje)
      } finally {
        setLoading(false)
      }
    }

    if (!Number.isNaN(id) && id > 0) {
      void cargar()
    } else {
      setError('Id inválido')
      setLoading(false)
    }
  }, [id])

  return {
    detalle,
    loading,
    error
  }
}
