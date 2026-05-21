import { useState, useRef, useCallback } from 'react'
import { Inmueble } from '@/types/inmueble'

export function useClusterSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [clusterProperties, setClusterProperties] = useState<Inmueble[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // #10 — ref al div scrolleable del sidebar
  const sidebarRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef<number>(0)

  const saveScrollPosition = useCallback(() => {
    if (sidebarRef.current) {
      scrollPositionRef.current = sidebarRef.current.scrollTop
    }
  }, [])

  const restoreScrollPosition = useCallback(() => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = scrollPositionRef.current
    }
  }, [])

  // #4 — restaurar lista general
  const restoreGeneralList = useCallback(() => {
    setClusterProperties([])
    setIsOpen(false)
    setError(null)
    scrollPositionRef.current = 0
  }, [])

  // #5 — abrir con skeleton (aparece inmediatamente, <300ms)
  const openCluster = useCallback(
    async (properties: Inmueble[], fetchFn?: () => Promise<Inmueble[]>) => {
      setIsOpen(true)
      setError(null)
      if (fetchFn) {
        setIsLoading(true)
        setClusterProperties([])
        try {
          const data = await fetchFn()
          setClusterProperties(data)
        } catch {
          // #6 — captura error
          setError('No se pudieron cargar los inmuebles')
          setClusterProperties([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setClusterProperties(properties)
      }
    },
    []
  )

  const retryLoad = useCallback(
    async (fetchFn: () => Promise<Inmueble[]>) => {
      await openCluster([], fetchFn)
    },
    [openCluster]
  )

  // #4 — closeCluster llama a restoreGeneralList
  const closeCluster = useCallback(() => {
    restoreGeneralList()
  }, [restoreGeneralList])

  return {
    isOpen,
    clusterProperties,
    isLoading,
    error,
    sidebarRef,
    openCluster,
    closeCluster,
    retryLoad,
    restoreGeneralList,
    saveScrollPosition,
    restoreScrollPosition
  }
}
