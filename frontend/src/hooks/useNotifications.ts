'use client'

import { useEffect, useRef, useState } from 'react'
import { mockNotifications } from '@/data/mockNotifications'

export function useNotifications() {
  const [open, setOpen] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  const notifications = mockNotifications

  const toggleNotifications = () => {
    setOpen((prev) => !prev)
  }

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
    notifications,
    notificationRef,
    toggleNotifications
  }
}
