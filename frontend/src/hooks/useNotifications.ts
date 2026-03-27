'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { mockNotifications } from '@/data/mockNotifications'
import type { NotificationItem } from '@/types/notification'

type FilterType = 'todas' | 'leida' | 'no leida' | 'archivada'

export function useNotifications() {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<FilterType>('todas')
  const notificationRef = useRef<HTMLDivElement>(null)

  const notifications: NotificationItem[] = mockNotifications

  const toggleNotifications = () => {
    setOpen((prev) => !prev)
  }

  const filteredNotifications = useMemo(() => {
    if (filter === 'todas') {
      return notifications
    }

    return notifications.filter((notification) => notification.status === filter)
  }, [filter, notifications])

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
    notificationRef,
    toggleNotifications,
    setFilter
  }
}
