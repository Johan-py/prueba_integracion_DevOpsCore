'use client'

import Link from 'next/link'
import { Bell, CheckCheck, Loader2, Trash2 } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import type { NotificationFilter } from '@/types/notification'

const filters: NotificationFilter[] = ['todas', 'no leida', 'leida']

export default function Navbar() {
  const {
    open,
    filter,
    unreadCount,
    visibleNotifications,
    isLoading,
    error,
    notificationRef,
    toggleNotifications,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMoreNotifications,
    hasMore,
    refreshNotifications
  } = useNotifications()

  return (
    <nav className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-gray-800">
          PropBol
        </Link>

        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={toggleNotifications}
            className="relative rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-800"
            aria-label="Abrir notificaciones"
          >
            <Bell className="h-6 w-6" />

            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </button>

          {open ? (
            <div className="absolute right-0 z-50 mt-3 w-[360px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Notificaciones</h3>
                  <p className="text-xs text-gray-500">Gestiona tus avisos recientes</p>
                </div>

                <button
                  onClick={() => void markAllAsRead()}
                  className="inline-flex items-center gap-1 text-xs text-blue-500 transition hover:text-blue-600"
                >
                  <CheckCheck className="h-4 w-4" />
                  Marcar todas
                </button>
              </div>

              <div className="flex gap-2 border-b border-gray-100 px-4 py-3">
                {filters.map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`rounded-full px-3 py-1 text-xs transition ${
                      filter === item
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="max-h-[420px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando notificaciones...
                  </div>
                ) : error ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-red-500">{error}</p>
                    <button
                      onClick={() => void refreshNotifications(filter)}
                      className="mt-3 rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : visibleNotifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-gray-500">
                    No hay notificaciones
                  </p>
                ) : (
                  <>
                    {visibleNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`border-b border-gray-100 px-4 py-3 last:border-b-0 ${
                          notification.status === 'no leida' ? 'bg-blue-50' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-semibold text-gray-800">
                              {notification.title?.trim() || '(Sin título)'}
                            </h4>

                            <p className="mt-1 text-sm text-gray-600">
                              {notification.description?.trim() || '(Sin descripción disponible)'}
                            </p>

                            <span className="mt-2 inline-block text-[10px] uppercase text-gray-400">
                              {notification.status}
                            </span>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {notification.status === 'no leida' ? (
                              <button
                                onClick={() => void markAsRead(notification.id)}
                                className="text-xs text-blue-500 transition hover:text-blue-600"
                              >
                                Leer
                              </button>
                            ) : null}

                            <button
                              onClick={() => void deleteNotification(notification.id)}
                              className="text-xs text-red-500 transition hover:text-red-600"
                              aria-label="Eliminar notificación"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {hasMore ? (
                      <div className="border-t border-gray-100 p-3">
                        <button
                          onClick={loadMoreNotifications}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                        >
                          Cargar más
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </div>

              <div className="border-t border-gray-100 px-4 py-3 text-center">
                <Link
                  href="/notificaciones"
                  className="text-sm font-medium text-blue-500 transition hover:text-blue-600"
                >
                  Ver todas las notificaciones
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  )
}
