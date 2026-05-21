'use client'

import { useEffect, useCallback, useRef } from 'react'
import { Inmueble } from '@/types/inmueble'
import { ClusterSidebarProps } from './types'

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatPrecio(precio: number | string): string {
  const num = typeof precio === 'string' ? parseFloat(precio) : precio
  if (isNaN(num)) return String(precio)
  return `$${num.toLocaleString('es-BO')}`
}

function getTipoLabel(inmueble: Inmueble): string {
  return inmueble.categoria ?? inmueble.tipoAccion ?? 'Inmueble'
}

// ── #5 Skeleton loader ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-white animate-pulse">
      <div className="w-20 h-20 rounded-lg bg-gray-200 shrink-0" />
      <div className="flex flex-col gap-2 flex-1 justify-center">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-3 p-3">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

// ── #2 Imagen genérica ─────────────────────────────────────────────────────────
function InmuebleImage() {
  return (
    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 shrink-0 flex items-center justify-center">
      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15v-6H9v6H3.75A.75.75 0 013 21V9.75z"
        />
      </svg>
    </div>
  )
}

// ── #7 Tooltip de precio (exportado para usar en MapView) ──────────────────────
export function PriceTooltip({ precio, visible }: { precio: number | string; visible: boolean }) {
  if (!visible) return null
  return (
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg z-50 pointer-events-none">
      {formatPrecio(precio)}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
    </div>
  )
}

// ── #2 Tarjeta de inmueble ─────────────────────────────────────────────────────
function TarjetaInmueble({ inmueble }: { inmueble: Inmueble }) {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-white hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-100">
      <InmuebleImage />
      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
        <p className="text-blue-600 font-bold text-sm truncate">{formatPrecio(inmueble.precio)}</p>
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide truncate">
          {getTipoLabel(inmueble)}
        </p>
        <div className="flex items-center gap-3 text-gray-600 text-xs">
          {inmueble.nroCuartos != null && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7h18M3 12h18M3 17h18"
                />
              </svg>
              {inmueble.nroCuartos} hab.
            </span>
          )}
          {inmueble.superficieM2 != null && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"
                />
              </svg>
              {inmueble.superficieM2} m²
            </span>
          )}
        </div>
        {inmueble.ubicacion?.zona && (
          <p className="text-gray-400 text-xs truncate">
            📍 {inmueble.ubicacion.zona}
            {inmueble.ubicacion.ciudad ? `, ${inmueble.ubicacion.ciudad}` : ''}
          </p>
        )}
      </div>
    </div>
  )
}

// ── #6 Estado de error ─────────────────────────────────────────────────────────
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      </div>
      <p className="text-gray-600 text-sm font-medium">No se pudieron cargar los inmuebles</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}

// ── ClusterSidebar principal ───────────────────────────────────────────────────
export function ClusterSidebar({
  clusterProperties,
  isOpen,
  onClose,
  isLoading = false,
  error = null,
  onRetry
}: ClusterSidebarProps) {
  // #10 — ref para mantener scroll
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollPos = useRef<number>(0)

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      scrollPos.current = scrollRef.current.scrollTop
    }
  }, [])

  // Restaurar scroll al re-renderizar con mismo cluster
  useEffect(() => {
    if (scrollRef.current && !isLoading) {
      scrollRef.current.scrollTop = scrollPos.current
    }
  }, [clusterProperties, isLoading])

  // #4 — Escape cierra y restaura lista
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // #4 — click en backdrop restaura lista
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop — click en zona vacía (#4) */}
      <div className="fixed inset-0 z-30 md:hidden" onClick={handleBackdropClick} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-80 bg-gray-50 shadow-2xl z-40 flex flex-col translate-x-0">
        {/* Header con botón ← Volver (#4) */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {isLoading
              ? 'Cargando...'
              : error
                ? 'Error'
                : `${clusterProperties.length} inmueble${clusterProperties.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Contenido con scroll (#10) */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain"
          onScroll={handleScroll}
        >
          {/* #5 — Skeleton */}
          {isLoading && <SkeletonList />}

          {/* #6 — Error */}
          {!isLoading && error && <ErrorState onRetry={onRetry} />}

          {/* #2 — Lista de tarjetas */}
          {!isLoading && !error && (
            <div className="flex flex-col gap-2 p-3">
              {clusterProperties.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-12">
                  No hay inmuebles en este cluster
                </p>
              ) : (
                clusterProperties.map((inmueble) => (
                  <TarjetaInmueble key={inmueble.id} inmueble={inmueble} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
