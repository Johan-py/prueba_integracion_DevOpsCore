'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

<<<<<<< HEAD
const INACTIVITY_LIMIT_MS = 15 * 60 * 1000
const WARNING_BEFORE_MS = 1 * 60 * 1000

=======
const INACTIVITY_LIMIT_MS = 20 * 60 * 1000
const WARNING_BEFORE_MS = 1 * 60 * 1000

const TOKEN_STORAGE_KEY = 'token'
const USER_STORAGE_KEY = 'propbol_user'
const SESSION_EXPIRES_KEY = 'propbol_session_expires'

>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5
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
<<<<<<< HEAD
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
=======
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current)
      logoutTimer.current = null
    }

    if (warningTimer.current) {
      clearTimeout(warningTimer.current)
      warningTimer.current = null
    }
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(SESSION_EXPIRES_KEY)
    window.dispatchEvent(new Event('propbol:session-changed'))
  }, [])

  const logout = useCallback(() => {
    clearTimers()
    clearSession()
    onLogout?.()
    router.replace('/sign-in?reason=inactivity')
  }, [clearSession, clearTimers, onLogout, router])

  const resetInactivityTimer = useCallback(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)

    if (!token) {
      clearTimers()
      return
    }

    clearTimers()

    localStorage.setItem(SESSION_EXPIRES_KEY, String(Date.now() + INACTIVITY_LIMIT_MS))
>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5

    warningTimer.current = setTimeout(() => {
      onWarning?.()
    }, INACTIVITY_LIMIT_MS - WARNING_BEFORE_MS)

    logoutTimer.current = setTimeout(() => {
      logout()
    }, INACTIVITY_LIMIT_MS)
  }, [clearTimers, logout, onWarning])

  useEffect(() => {
<<<<<<< HEAD
    resetTimers()

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimers, { passive: true })
    )

    return () => {
      clearTimers()
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimers))
    }
  }, [resetTimers, clearTimers])
=======
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)

    if (!token) return

    resetInactivityTimer()

    const handleActivity = () => {
      resetInactivityTimer()
    }

    const handleStorageSync = () => {
      const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY)

      if (!currentToken) {
        clearTimers()
        onLogout?.()
        return
      }

      resetInactivityTimer()
    }

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    window.addEventListener('propbol:login', handleActivity)
    window.addEventListener('propbol:session-changed', handleStorageSync)

    return () => {
      clearTimers()

      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })

      window.removeEventListener('propbol:login', handleActivity)
      window.removeEventListener('propbol:session-changed', handleStorageSync)
    }
  }, [clearTimers, onLogout, resetInactivityTimer])

  return {
    resetInactivityTimer,
    logout
  }
>>>>>>> 12892ab53161466e83fa52424359eeccc35604a5
}
