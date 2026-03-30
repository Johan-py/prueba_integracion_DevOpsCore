'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  NotificationFilter,
  NotificationItem,
  NotificationsResponse,
  UnreadCountResponse
} from '@/types/notification'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
const ITEMS_PER_LOAD = 20
const NOTIFICATIONS_UPDATED_EVENT = 'notifications-updated'

const getAuthHeaders = (): HeadersInit => {
  if (typeof window === 'undefined') {
    return {}
  }

  const token = window.localStorage.getItem('token')

  if (!token) {
    return {}
  }

  return {
    Authorization: `Bearer ${token}`
  }
}

const buildNotificationsUrl = (filter: NotificationFilter, limit: number, offset: number) => {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset)
  })

  if (filter !== 'todas') {
    params.set('filter', filter)
  }

  return `${API_URL}/notificaciones?${params.toString()}`
}

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => {
    controller.abort()
  }, 8000)

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...getAuthHeaders(),
        ...(init?.headers ?? {})
      },
      signal: controller.signal
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const error = new Error(data?.message ?? 'No se pudo completar la solicitud') as Error & {
        status?: number
      }

      error.status = response.status
      throw error
    }

    return data as T
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      const timeoutError = new Error('No se pudieron cargar las notificaciones.') as Error & {
        status?: number
      }

      timeoutError.status = 408
      throw timeoutError
    }

    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

export function useNotifications() {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<NotificationFilter>('todas')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [total, setTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const notificationRef = useRef<HTMLDivElement>(null)
  const instanceId = useRef(`notifications-${Math.random().toString(36).slice(2)}`)

  const emitNotificationsUpdated = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.dispatchEvent(
      new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, {
        detail: { source: instanceId.current }
      })
    )
  }, [])

  const refreshNotifications = useCallback(async (nextFilter: NotificationFilter) => {
    setIsLoading(true)
    setError(null)

    try {
      const [notificationsResponse, unreadCountResponse] = await Promise.all([
        requestJson<NotificationsResponse>(buildNotificationsUrl(nextFilter, ITEMS_PER_LOAD, 0)),
        requestJson<UnreadCountResponse>(`${API_URL}/notificaciones/unread-count`)
      ])

      setNotifications(notificationsResponse.items)
      setTotal(notificationsResponse.total)
      setUnreadCount(unreadCountResponse.unreadCount)
      setIsLoggedIn(true)
    } catch (err) {
      const error = err as Error & { status?: number }
      const technicalMessage = error.message.toLowerCase()

      if (technicalMessage.includes('no autorizado') || technicalMessage.includes('token')) {
        setIsLoggedIn(false)
      }

      if (error.status === 500) {
        setError('Ocurrió un problema al cargar las notificaciones.')
      } else {
        setError('No se pudieron cargar las notificaciones.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadMoreNotifications = useCallback(async () => {
    if (isLoading || isLoadingMore || notifications.length >= total) {
      return
    }

    setIsLoadingMore(true)

    try {
      const response = await requestJson<NotificationsResponse>(
        buildNotificationsUrl(filter, ITEMS_PER_LOAD, notifications.length)
      )

      setNotifications((prev) => [...prev, ...response.items])
      setTotal(response.total)
    } catch {
      setError('No se pudieron cargar las notificaciones.')
    } finally {
      setIsLoadingMore(false)
    }
  }, [filter, isLoading, isLoadingMore, notifications.length, total])

  const toggleNotifications = () => {
    setOpen((prev) => !prev)
  }

  const markAsRead = useCallback(
    async (id: number) => {
      await requestJson(`${API_URL}/notificaciones/${id}/read`, {
        method: 'PATCH'
      })

      await refreshNotifications(filter)
      emitNotificationsUpdated()
    },
    [emitNotificationsUpdated, filter, refreshNotifications]
  )

  const markAllAsRead = useCallback(async () => {
    await requestJson(`${API_URL}/notificaciones/read-all`, {
      method: 'PATCH'
    })

    await refreshNotifications(filter)
    emitNotificationsUpdated()
  }, [emitNotificationsUpdated, filter, refreshNotifications])

  const deleteNotification = useCallback(
    async (id: number) => {
      await requestJson(`${API_URL}/notificaciones/${id}`, {
        method: 'DELETE'
      })

      await refreshNotifications(filter)
      emitNotificationsUpdated()
    },
    [emitNotificationsUpdated, filter, refreshNotifications]
  )

  const hasMore = notifications.length < total

  useEffect(() => {
    void refreshNotifications(filter)
  }, [filter, refreshNotifications])

  useEffect(() => {
    const handleNotificationsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ source?: string }>

      if (customEvent.detail?.source === instanceId.current) {
        return
      }

      void refreshNotifications(filter)
    }

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated)

    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated)
    }
  }, [filter, refreshNotifications])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filteredNotifications = useMemo(() => notifications, [notifications])
  const visibleNotifications = useMemo(() => notifications, [notifications])

  return {
    open,
    filter,
    notifications,
    filteredNotifications,
    visibleNotifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    error,
    notificationRef,
    toggleNotifications,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMoreNotifications,
    hasMore,
    refreshNotifications,
    isLoggedIn,
    setIsLoggedIn
  }
}
