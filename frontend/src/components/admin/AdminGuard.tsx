'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { USER_STORAGE_KEY, SessionUser } from '@/lib/session'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY)

      if (!savedUser) {
        router.push('/')
        return
      }

      try {
        const user = JSON.parse(savedUser) as SessionUser
        if (user.role === 'ADMIN') {
          setIsAuthorized(true)
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Error parsing user session:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // También escuchar cambios en el localStorage por si el usuario cierra sesión en otra pestaña
    window.addEventListener('storage', checkAuth)
    window.addEventListener('propbol:session-changed', checkAuth)

    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('propbol:session-changed', checkAuth)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
