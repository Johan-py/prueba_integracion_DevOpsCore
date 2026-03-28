'use client'

import { useState } from 'react'
import { eliminarPublicacion } from '@/services/publicacion.service'

export function useDeletePublicacion(publicacionId: number) {
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false)
  const [modalExitoAbierto, setModalExitoAbierto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abrirConfirmacion = () => {
    setError(null)
    setModalConfirmacionAbierto(true)
  }

  const cerrarConfirmacion = () => {
    if (loading) return
    setModalConfirmacionAbierto(false)
  }

  const cerrarExito = () => {
    setModalExitoAbierto(false)
  }

  const confirmarEliminacion = async () => {
    try {
      setLoading(true)
      setError(null)

      await eliminarPublicacion(publicacionId)

      setModalConfirmacionAbierto(false)
      setModalExitoAbierto(true)
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Ocurrió un error inesperado'
      setError(mensaje)
    } finally {
      setLoading(false)
    }
  }

  return {
    modalConfirmacionAbierto,
    modalExitoAbierto,
    loading,
    error,
    abrirConfirmacion,
    cerrarConfirmacion,
    cerrarExito,
    confirmarEliminacion
  }
}
