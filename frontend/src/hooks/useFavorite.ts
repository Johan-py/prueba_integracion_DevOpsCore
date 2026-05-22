'use client'

import { useEffect, useState } from 'react'
import { addFavorite, getFavoriteStatus, removeFavorite } from '@/services/favorites.service'

interface UseFavoriteParams {
  inmuebleId: number
  isAuthenticated: boolean
  onRequireAuth?: () => void
}

export function useFavorite({ inmuebleId, isAuthenticated, onRequireAuth }: UseFavoriteParams) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !inmuebleId) {
      setIsFavorite(false)
      setIsLoadingStatus(false)
      return
    }

    const loadStatus = async () => {
      try {
        setIsLoadingStatus(true)
        const data = await getFavoriteStatus(inmuebleId)
        setIsFavorite(Boolean(data.is_favorite))
      } catch (error) {
        console.error('Error al cargar estado de favorito:', error)
        setIsFavorite(false)
      } finally {
        setIsLoadingStatus(false)
      }
    }

    void loadStatus()
  }, [inmuebleId, isAuthenticated])

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      onRequireAuth?.()
      return
    }

    try {
      setIsSubmitting(true)

      if (isFavorite) {
        await removeFavorite(inmuebleId)
        setIsFavorite(false)
      } else {
        await addFavorite(inmuebleId)
        setIsFavorite(true)
      }
    } catch (error) {
      console.error('Error al cambiar favorito:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isFavorite,
    isLoadingStatus,
    isSubmitting,
    toggleFavorite
  }
}
