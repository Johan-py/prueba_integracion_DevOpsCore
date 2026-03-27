'use client'

import Link from 'next/link'
import { useNotifications } from '@/hooks/useNotifications'

export default function Navbar() {
  const {
    open,
    filter,
    notifications,
    filteredNotifications,
    notificationRef,
    toggleNotifications,
    setFilter,
    markAsRead,
    archiveNotification
  } = useNotifications()

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            PropBol
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/" className="transition hover:text-blue-600">
              Inicio
            </Link>

            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={toggleNotifications}
                className="relative rounded-full p-2 transition hover:bg-gray-100"
                aria-label="Abrir notificaciones"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>

                {notifications.filter((n) => n.status === 'no leida').length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                    {notifications.filter((n) => n.status === 'no leida').length}
                  </span>
                )}
              </button>

              {open && (
                <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <h3 className="text-sm font-semibold text-gray-800">Notificaciones</h3>
                  </div>

                  <div className="flex flex-wrap gap-2 border-b border-gray-100 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setFilter('todas')}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        filter === 'todas'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Todas
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilter('leida')}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        filter === 'leida'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Leídas
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilter('no leida')}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        filter === 'no leida'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      No leídas
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilter('archivada')}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        filter === 'archivada'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Archivadas
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-gray-500">
                        No hay notificaciones
                      </p>
                    ) : (
                      filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`cursor-pointer border-b border-gray-100 px-4 py-3 transition hover:bg-gray-50 ${
                            notification.status === 'no leida' ? 'bg-blue-50' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-800">
                              {notification.title}
                            </p>

                            <span className="text-[10px] uppercase text-gray-400">
                              {notification.status}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-gray-600">{notification.description}</p>
                          {notification.status !== 'archivada' && (
                            <div className="mt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  archiveNotification(notification.id)
                                }}
                                className="text-xs text-gray-400 hover:text-gray-600 transition"
                              >
                                Archivar
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
