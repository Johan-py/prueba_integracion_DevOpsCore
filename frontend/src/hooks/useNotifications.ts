'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { mockNotifications } from '@/data/mockNotifications'
import type { NotificationItem } from '@/types/notification'

type FilterType = 'todas' | 'leida' | 'no leida' | 'archivada'

const ITEMS_PER_LOAD = 20

export function useNotifications() {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<FilterType>('todas')
  const notificationRef = useRef<HTMLDivElement>(null)

  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const toggleNotifications = () => {
    setOpen((prev) => !prev)
  }

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: 'leida' } : n)))
  }

  const archiveNotification = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: 'archivada' } : n)))
  }

  const filteredNotifications = useMemo(() => {
    if (filter === 'todas') {
      return notifications
    }

    return notifications.filter((notification) => notification.status === filter)
  }, [filter, notifications])

  const visibleNotifications = useMemo(() => {
    return filteredNotifications.slice(0, visibleCount)
  }, [filteredNotifications, visibleCount])

  const loadMoreNotifications = () => {
    if (visibleCount < filteredNotifications.length) {
      setVisibleCount((prev) => prev + ITEMS_PER_LOAD)
    }
  }

  useEffect(() => {
    setVisibleCount(ITEMS_PER_LOAD)
  }, [filter])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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
    notificationRef,
    toggleNotifications,
    setFilter,
    markAsRead,
    archiveNotification,
    loadMoreNotifications,
    isLoggedIn,
    setIsLoggedIn
  }
}
