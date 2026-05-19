'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Archive, Settings, Trash2, WifiOff } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import type { NotificationFilter } from '@/types/notification'

const filters: NotificationFilter[] = ['todas', 'no leida', 'leida', 'archivada']

const formatRelativeTime = (fecha: string | null): string => {
  if (!fecha) return ''

  const diff = Date.now() - new Date(fecha).getTime()
  const mins = Math.floor(diff / 60000)

  if (mins < 1) return 'hace un momento'
  if (mins < 60) return `hace ${mins} min`

  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours} h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days} d`

  return new Date(fecha).toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'short',
  })
}

export default function NotificationsPage() {
  const router = useRouter()
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const {
    filter,
    setFilter,
    visibleNotifications,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    refreshNotifications,
    isOnline,
  } = useNotifications()

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        router.back()
      }
    }

    window.addEventListener('keydown', handleEsc)

    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [router])

  useEffect(() => {
    const target = loadMoreRef.current
    const root = scrollContainerRef.current

    if (!target || !root || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0]

        if (firstEntry?.isIntersecting && !isLoadingMore) {
          void loadMoreNotifications()
        }
      },
      {
        root,
        rootMargin: '120px',
        threshold: 0.1,
      },
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoadingMore, loadMoreNotifications, visibleNotifications.length])

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-6">
      {!isOnline && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-stone-100 px-4 py-3 text-sm text-stone-600">
          <WifiOff className="h-4 w-4 shrink-0 text-stone-400" />
          <span>Sin conexión. Las notificaciones se actualizarán cuando vuelvas a conectarte.</span>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Todas las notificaciones</h1>
          <p className="mt-1 text-sm text-stone-500">
            Aquí puedes revisar, archivar, eliminar y marcar como leídas tus notificaciones.
          </p>
        </div>

        <button
          onClick={() => void markAllAsRead()}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
        >
          Marcar todas como leídas
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                filter === item
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {item === 'todas'
                ? 'Todas'
                : item === 'leida'
                  ? 'Leídas'
                  : item === 'no leida'
                    ? 'No leídas'
                    : 'Archivadas'}
            </button>
          ))}
        </div>

        <Link
          href="/configuracion/notificaciones"
          className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-600 transition hover:bg-stone-50"
        >
          <Settings className="h-4 w-4" />
          Configuración
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        {isLoading ? (
          <p className="px-4 py-8 text-center text-sm text-stone-500">Cargando notificaciones...</p>
        ) : error && isOnline ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={() => void refreshNotifications(filter)}
              className="mt-3 rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-50"
            >
              Reintentar
            </button>
          </div>
        ) : visibleNotifications.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-stone-500">No hay notificaciones</p>
        ) : (
          <div
            ref={scrollContainerRef}
            className="max-h-[70vh] overflow-y-auto"
          >
            {visibleNotifications.map((notification) => (
              <article
                key={notification.id}
                className={`border-b border-stone-100 px-4 py-4 last:border-b-0 ${
                  notification.status === 'no leida' ? 'bg-amber-50' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => {
                      if (notification.status === 'no leida' && isOnline) {
                        void markAsRead(notification.id)
                      }
                      if (notification.tipo === 'BLOG_APROBADO' && notification.blogId) {
                        router.push(`/blog/${notification.blogId}`)
                      } else if (notification.tipo === 'BLOG_RECHAZADO' && notification.blogId) {
                        router.push(`/blog/${notification.blogId}/edit`)
                      } else {
                        router.push(`/notificaciones/${notification.id}`)
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        if (notification.status === 'no leida' && isOnline) {
                          void markAsRead(notification.id)
                        }
                        if (notification.tipo === 'BLOG_APROBADO' && notification.blogId) {
                          router.push(`/blog/${notification.blogId}`)
                        } else if (notification.tipo === 'BLOG_RECHAZADO' && notification.blogId) {
                          router.push(`/blog/${notification.blogId}/edit`)
                        } else {
                          router.push(`/notificaciones/${notification.id}`)
                        }
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-start gap-2">
                      {notification.status === 'no leida' && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                      )}

                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-stone-900">
                          {notification.title?.trim() || '(Sin título)'}
                        </h2>

                        <p className={`mt-1 line-clamp-2 text-sm ${notification.tipo === 'BLOG_RECHAZADO' ? 'text-red-600' : 'text-stone-600'}`}>
                          {notification.description?.trim() || '(Sin descripción disponible)'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="text-right">
                      {notification.tipo === 'BLOG_APROBADO' && (
                        <span className="mb-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                          Aprobado
                        </span>
                      )}
                      {notification.tipo === 'BLOG_RECHAZADO' && (
                        <span className="mb-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                          Rechazado
                        </span>
                      )}
                      {notification.tipo === 'BLOG_PENDIENTE' && (
                        <span className="mb-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          Pendiente
                        </span>
                      )}
                      <p
                        className={`text-[11px] font-semibold uppercase tracking-wide ${
                          notification.status === 'no leida' ? 'text-amber-600' : 'text-stone-400'
                        }`}
                      >
                        {notification.status}
                      </p>

                      {notification.fechaCreacion && (
                        <p className="mt-1 text-[11px] text-stone-400">
                          {formatRelativeTime(notification.fechaCreacion)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {!notification.archivada && (
                        <button
                          onClick={() => void archiveNotification(notification.id)}
                          className="flex items-center gap-1 text-xs text-stone-400 transition hover:text-amber-600"
                        >
                          <Archive className="h-3.5 w-3.5" />
                          Archivar
                        </button>
                      )}

                      <button
                        onClick={() => void deleteNotification(notification.id)}
                        className="flex items-center gap-1 text-xs text-stone-400 transition hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {hasMore && <div ref={loadMoreRef} className="h-8 w-full" />}

            {isLoadingMore && (
              <p className="px-4 py-4 text-center text-sm text-stone-500">
                Cargando más notificaciones...
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}