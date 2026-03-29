'use client'
import { useEffect } from 'react'
import { mockNotifications } from '@/data/mockNotifications'

export default function NotificationsPage() {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        alert('Cerrar notificaciones (simulado)')
      }
    }

    document.addEventListener('keydown', handleEsc)

    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Todas las notificaciones</h1>
        <p className="mt-1 text-sm text-gray-500">Notificaciones del usuario.</p>
      </div>

      <div
        role="list"
        aria-label="Lista de notificaciones"
        aria-live="polite"
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        {mockNotifications.length === 0 ? (
          <p
            role="status"
            aria-live="polite"
            className="px-4 py-6 text-center text-sm text-gray-500"
          >
            No hay notificaciones
          </p>
        ) : (
          mockNotifications.map((notification) => (
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
            </div>
          ))
        )}
      </div>
    </section>
  )
}
