"use client";

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, Trash2, WifiOff } from 'lucide-react'
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
  return new Date(fecha).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })
}
export default function NotificationsPage() {
  const router = useRouter()
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const [, setTick] = useState(0)
  
  const {
    filter,
    setFilter,
    visibleNotifications,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    isOnline,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification, 
    refreshNotifications
  } = useNotifications()

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [router]);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry?.isIntersecting) {
          void loadMoreNotifications();
        }
      },
      {
        root: null,
        rootMargin: "120px",
        threshold: 0.1,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMoreNotifications, visibleNotifications.length]);

  return (
    <section className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-4 sm:py-6">
      {!isOnline && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-stone-100 px-3 py-3 text-sm text-stone-600 sm:px-4">
          <WifiOff className="h-4 w-4 shrink-0 text-stone-400" />
          <span>
            Sin conexión. Las notificaciones se actualizarán cuando vuelvas a
            conectarte.
          </span>
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">
            Todas las notificaciones
          </h1>
          <p className="mt-0.5 text-sm text-stone-500">
            Aquí puedes revisar, marcar como leídas y eliminar tus
            notificaciones.
          </p>
        </div>

        <button
          onClick={() => void markAllAsRead()}
          className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 sm:w-auto sm:py-2"
        >
          Marcar todas como leídas
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition sm:py-1 ${
              filter === item
                ? "bg-amber-600 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {item === 'todas'
              ? 'Todas'
              : item === 'leida'
                ? 'Leídas'
                : item === 'no leida'
                  ? 'No leídas'
                  : 'Archivadas' }
          </button>
        ))}
      </div>

      <div
        role="list"
        aria-label="Lista de notificaciones"
        aria-live="polite"
        className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
      >
        {isLoading ? (
          <p className="px-4 py-6 text-center text-sm text-stone-500">
            Cargando notificaciones...
          </p>
        ) : error && isOnline ? (
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
                onClick={() => {
                  if (notification.status === 'no leida' && isOnline) {
                    void markAsRead(notification.id)
                  }
                }}
                className={`border-b border-stone-100 px-3 py-4 last:border-b-0 transition sm:px-4 ${
                  notification.status === 'no leida' ? 'cursor-pointer bg-amber-50' : 'bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-start gap-2">
                    {notification.status === 'no leida' && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    )}
                    <h2 className="text-sm font-semibold leading-snug text-stone-900">
                      {notification.title?.trim() || '(Sin título)'}
                    </h2>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span
                      className={`text-[10px] font-medium uppercase tracking-wide ${
                        notification.status === 'no leida' ? 'text-amber-600' : 'text-stone-400'
                      }`}
                    >
                      {notification.status}
                    </span>
                    {notification.fechaCreacion && ( 
                      <span className="text-[10px] text-stone-400">
                        {formatRelativeTime(notification.fechaCreacion)}
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-1 text-sm text-stone-600">
                  {notification.description?.trim() ||
                    "(Sin descripción disponible)"}
                </p>

                <div className="mt-3 flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-3">
                    {!notification.archivada && ( 
                      <button
                        onClick={() => void archiveNotification(notification.id)}
                        className="flex items-center gap-1 text-xs text-stone-400 transition hover:text-amber-600"
                      >
                        <Archive className="h-3 w-3" />
                        Archivar
                      </button>
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
  );
}
