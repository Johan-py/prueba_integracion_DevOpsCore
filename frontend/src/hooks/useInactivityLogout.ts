'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000
const WARNING_BEFORE_MS = 1 * 60 * 1000

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'] as const

type UseInactivityLogoutOptions = {
  onWarning?: () => void
  onLogout?: () => void
}

export function useInactivityLogout({ onWarning, onLogout }: UseInactivityLogoutOptions = {}) {
  const router = useRouter()
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current)
    if (warningTimer.current) clearTimeout(warningTimer.current)
  }, [])

  const logout = useCallback(async () => {
    const token = localStorage.getItem('token')

    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch {}
      localStorage.removeItem('token')
    }

    onLogout?.()
    router.push('/sign-in')
  }, [router, onLogout])

  const resetTimers = useCallback(() => {
    clearTimers()

    warningTimer.current = setTimeout(() => {
      onWarning?.()
    }, INACTIVITY_LIMIT_MS - WARNING_BEFORE_MS)

    logoutTimer.current = setTimeout(() => {
      logout()
    }, INACTIVITY_LIMIT_MS)
  }, [clearTimers, logout, onWarning])

  useEffect(() => {
    resetTimers()

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimers, { passive: true })
    )

    return () => {
      clearTimers()
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimers))
    }
  }, [resetTimers, clearTimers])
}
