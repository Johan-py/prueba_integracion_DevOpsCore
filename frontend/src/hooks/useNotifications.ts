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

const buildNotificationsUrl = (filter: NotificationFilter) => {
  const params = new URLSearchParams({
    limit: '100',
    offset: '0'
  })

  if (filter !== 'todas') {
    params.set('filter', filter)
  }

  return `${API_URL}/notificaciones?${params.toString()}`
}

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...getAuthHeaders(),
      ...(init?.headers ?? {})
    }
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message ?? 'No se pudo completar la solicitud')
  }

  return data as T
}

export function useNotifications() {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<NotificationFilter>('todas')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
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
        requestJson<NotificationsResponse>(buildNotificationsUrl(nextFilter)),
        requestJson<UnreadCountResponse>(`${API_URL}/notificaciones/unread-count`)
      ])

      setNotifications(notificationsResponse.items)
      setUnreadCount(unreadCountResponse.unreadCount)
      setIsLoggedIn(true)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudieron cargar las notificaciones'

      setError(message)

      if (
        message.toLowerCase().includes('no autorizado') ||
        message.toLowerCase().includes('token')
      ) {
        setIsLoggedIn(false)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

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

  const loadMoreNotifications = () => {
    if (visibleCount < notifications.length) {
      setVisibleCount((prev) => prev + ITEMS_PER_LOAD)
    }
  }

  const filteredNotifications = useMemo(() => {
    return notifications
  }, [notifications])

  const visibleNotifications = useMemo(() => {
    return filteredNotifications.slice(0, visibleCount)
  }, [filteredNotifications, visibleCount])

  const hasMore = visibleCount < filteredNotifications.length

  useEffect(() => {
    setVisibleCount(ITEMS_PER_LOAD)
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

  return {
    open,
    filter,
    notifications,
    filteredNotifications,
    visibleNotifications,
    unreadCount,
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
    refreshNotifications,
    isLoggedIn,
    setIsLoggedIn
  }
}
