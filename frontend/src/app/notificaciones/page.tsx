'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/hooks/useNotifications'
import type { NotificationFilter } from '@/types/notification'

const filters: NotificationFilter[] = ['todas', 'no leida', 'leida']

export default function NotificationsPage() {
  const router = useRouter()

  const {
    filter,
    setFilter,
    visibleNotifications,
    isLoading,
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

  return (
    <section className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Todas las notificaciones</h1>
          <p className="text-sm text-gray-500">
            Aquí puedes revisar, marcar como leídas y eliminar tus notificaciones.
          </p>
        </div>

        <button
          onClick={() => void markAllAsRead()}
          className="rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
        >
          Marcar todas como leídas
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full px-3 py-1 text-sm transition ${
              filter === item
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div
        role="list"
        aria-label="Lista de notificaciones"
        aria-live="polite"
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        {isLoading ? (
          <p className="px-4 py-6 text-center text-sm text-gray-500">Cargando notificaciones...</p>
        ) : error ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={() => void refreshNotifications(filter)}
              className="mt-3 rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              Reintentar
            </button>
          </div>
        ) : visibleNotifications.length === 0 ? (
          <p
            role="status"
            aria-live="polite"
            className="px-4 py-6 text-center text-sm text-gray-500"
          >
            No hay notificaciones
          </p>
        ) : (
          visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              role="listitem"
              tabIndex={0}
              aria-label={`Notificación: ${notification.title}`}
              className={`border-b border-gray-100 px-4 py-4 last:border-b-0 ${
                notification.status === 'no leida' ? 'bg-blue-50' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-gray-800">
                  {notification.title?.trim() || '(Sin título)'}
                </h2>
                <span className="text-[10px] uppercase text-gray-400">{notification.status}</span>
              </div>

              <p className="mt-1 text-sm text-gray-600">
                {notification.description?.trim() || '(Sin descripción disponible)'}
              </p>

              <div className="mt-3 flex items-center justify-between gap-3">
                {notification.status === 'no leida' ? (
                  <button
                    onClick={() => void markAsRead(notification.id)}
                    className="text-xs text-blue-500 transition hover:text-blue-600 hover:underline"
                  >
                    Marcar como leída
                  </button>
                ) : (
                  <span />
                )}

                <button
                  onClick={() => void deleteNotification(notification.id)}
                  className="text-xs text-red-500 transition hover:text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && !isLoading ? (
        <div className="mt-4 flex justify-center">
          <button
            onClick={loadMoreNotifications}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            Cargar más
          </button>
        </div>
      ) : null}
    </section>
  )
}
