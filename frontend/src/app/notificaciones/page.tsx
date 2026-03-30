'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import type { NotificationFilter } from '@/types/notification'

const filters: NotificationFilter[] = ['todas', 'no leida', 'leida']

export default function NotificationsPage() {
  const router = useRouter()
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

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
    refreshNotifications
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

    if (!target || !hasMore) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0]

        if (firstEntry?.isIntersecting) {
          void loadMoreNotifications()
        }
      },
      {
        root: null,
        rootMargin: '120px',
        threshold: 0.1
      }
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, loadMoreNotifications, visibleNotifications.length])

  return (
    <section className="mx-auto max-w-3xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Todas las notificaciones</h1>
          <p className="text-sm text-stone-500">
            Aquí puedes revisar, marcar como leídas y eliminar tus notificaciones.
          </p>
        </div>

        <button
          onClick={() => void markAllAsRead()}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
        >
          Marcar todas como leídas
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              filter === item
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* List */}
      <div
        role="list"
        aria-label="Lista de notificaciones"
        aria-live="polite"
        className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
      >
        {isLoading ? (
          <p className="px-4 py-6 text-center text-sm text-stone-500">Cargando notificaciones...</p>
        ) : error ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={() => void refreshNotifications(filter)}
              className="mt-3 rounded border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-50"
            >
              Reintentar
            </button>
          </div>
        ) : visibleNotifications.length === 0 ? (
          <p
            role="status"
            aria-live="polite"
            className="px-4 py-6 text-center text-sm text-stone-500"
          >
            No hay notificaciones
          </p>
        ) : (
          <>
            {visibleNotifications.map((notification) => (
              <div
                key={notification.id}
                role="listitem"
                tabIndex={0}
                aria-label={`Notificación: ${notification.title}`}
                className={`border-b border-stone-100 px-4 py-4 last:border-b-0 transition ${
                  notification.status === 'no leida' ? 'bg-amber-50' : 'bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-stone-900">
                    {notification.title?.trim() || '(Sin título)'}
                  </h2>
                  <span
                    className={`text-[10px] font-medium uppercase tracking-wide ${
                      notification.status === 'no leida' ? 'text-amber-600' : 'text-stone-400'
                    }`}
                  >
                    {notification.status}
                  </span>
                </div>

                <p className="mt-1 text-sm text-stone-600">
                  {notification.description?.trim() || '(Sin descripción disponible)'}
                </p>

                <div className="mt-3 flex items-center justify-between gap-3">
                  {notification.status === 'no leida' ? (
                    <button
                      onClick={() => void markAsRead(notification.id)}
                      className="text-xs text-amber-600 transition hover:text-amber-700 hover:underline"
                    >
                      Marcar como leída
                    </button>
                  ) : (
                    <span />
                  )}

                  <button
                    onClick={() => void deleteNotification(notification.id)}
                    className="flex items-center gap-1 text-xs text-stone-400 transition hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

            {hasMore ? <div ref={loadMoreRef} className="h-8 w-full" /> : null}

            {isLoadingMore ? (
              <p className="px-4 py-4 text-center text-sm text-stone-500">
                Cargando más notificaciones...
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
