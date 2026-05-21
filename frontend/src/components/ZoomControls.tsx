'use client'

import { useMap } from 'react-leaflet'
import { useEffect, useState, useCallback } from 'react'

const MIN_ZOOM = 3
const MAX_ZOOM = 18

type ZoomAction = 'in' | 'out'

export default function ZoomControls() {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  const [active, setActive] = useState<ZoomAction | null>(null)

  useEffect(() => {
    const handleZoom = () => setZoom(map.getZoom())

    map.on('zoomend', handleZoom)

    return () => {
      map.off('zoomend', handleZoom)
    }
  }, [map])

  const handleZoomIn = useCallback(() => {
    if (zoom < MAX_ZOOM) {
      setActive('in')
      map.zoomIn()
      setTimeout(() => setActive(null), 300)
    }
  }, [map, zoom])

  const handleZoomOut = useCallback(() => {
    if (zoom > MIN_ZOOM) {
      setActive('out')
      map.zoomOut()
      setTimeout(() => setActive(null), 300)
    }
  }, [map, zoom])

  const isMaxZoom = zoom >= MAX_ZOOM
  const isMinZoom = zoom <= MIN_ZOOM

  const btnClass = (type: ZoomAction, disabled: boolean) => {
    const base = "w-[36px] h-[36px] text-[22px] font-semibold flex items-center justify-center transition-colors"
    if (disabled) return `${base} cursor-not-allowed bg-white dark:bg-stone-900 text-stone-300 dark:text-stone-600`
    if (active === type) return `${base} cursor-pointer bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white`
    return `${base} cursor-pointer bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800`
  }

  return (
    <div className="absolute top-4 left-[52px] z-[1000] flex flex-col bg-white dark:bg-stone-900 rounded-lg shadow-md border border-stone-200 dark:border-stone-700 overflow-hidden w-[36px]">
      <button
        onClick={handleZoomIn}
        disabled={isMaxZoom}
        aria-label="Zoom in"
        className={btnClass('in', isMaxZoom)}
      >
        +
      </button>

      <div className="h-px bg-stone-200 dark:bg-stone-700 mx-[6px]" />

      <button
        onClick={handleZoomOut}
        disabled={isMinZoom}
        aria-label="Zoom out"
        className={btnClass('out', isMinZoom)}
      >
        -
      </button>
    </div>
  )
}
