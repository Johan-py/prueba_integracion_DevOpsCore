'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Bell } from 'lucide-react'
import type { NotificationItem } from '@/types/notification'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

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
    month: 'long',
    year: 'numeric'
  })
}

export default function NotificationDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [notification, setNotification] = useState<NotificationItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const token = localStorage.getItem('token')

        const res = await fetch(`${API_URL}/notificaciones/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await res.json()
        setNotification(data.item)
      } catch (error) {
        console.error('Error al obtener la notificación:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotification()
  }, [id])

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">Cargando notificación...</p>
        </div>
      </section>
    )
  }

  if (!notification) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-stone-900">
            No se encontró la notificación
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            La notificación no existe o ya no está disponible.
          </p>

          <button
            type="button"
            onClick={() => router.push('/notificaciones')}
            className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Volver a notificaciones
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => router.push('/notificaciones')}
          className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
      </div>

      <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 bg-stone-50 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <Bell className="h-5 w-5 text-amber-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                Detalle de notificación
              </p>

              <h1 className="mt-1 text-2xl font-bold text-stone-900">
                {notification.title?.trim() || '(Sin título)'}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span
                  className={`rounded-full px-2.5 py-1 font-medium ${
                    notification.status === 'no leida'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {notification.status === 'no leida' ? 'No leída' : 'Leída'}
                </span>

                {notification.tipo === 'BLOG_APROBADO' && (
                  <span className="rounded-full bg-green-100 px-2.5 py-1 font-semibold text-green-700">
                    Aprobado
                  </span>
                )}
                {notification.tipo === 'BLOG_RECHAZADO' && (
                  <span className="rounded-full bg-red-100 px-2.5 py-1 font-semibold text-red-600">
                    Rechazado
                  </span>
                )}
                {notification.tipo === 'BLOG_PENDIENTE' && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-700">
                    Pendiente
                  </span>
                )}

                {notification.fechaCreacion && (
                  <span>{formatRelativeTime(notification.fechaCreacion)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
              Mensaje
            </h2>

            <p className={`whitespace-pre-line text-base leading-7 ${notification.tipo === 'BLOG_RECHAZADO' ? 'text-red-600' : 'text-stone-700'}`}>
              {notification.description?.trim() || '(Sin descripción disponible)'}
            </p>
          </div>

          {notification.tipo === 'BLOG_APROBADO' && notification.blogId && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push(`/blog/${notification.blogId}`)}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
              >
                Ver blog publicado
              </button>
            </div>
          )}

          {notification.tipo === 'BLOG_RECHAZADO' && notification.blogId && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push(`/blog/${notification.blogId}/edit`)}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
              >
                Editar y reenviar blog
              </button>
            </div>
          )}
        </div>
      </article>
    </section>
  )
}