'use client'

import { usePathname } from 'next/navigation'
import { useState, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useInactivityLogout } from '@/hooks/useInactivityLogout'

const AUTH_ROUTES = ['/sign-in', '/sign-up']

function SessionManager() {
  const [showWarning, setShowWarning] = useState(false)

  const handleWarning = useCallback(() => setShowWarning(true),  [])
  const handleLogout  = useCallback(() => setShowWarning(false), [])

  useInactivityLogout({
    onWarning: handleWarning,
    onLogout:  handleLogout,
  })

  if (!showWarning) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-orange-200 bg-white p-4 shadow-lg">
      <p className="text-sm font-medium text-gray-800">
        Tu sesión cerrará en 1 minuto por inactividad.
      </p>
      <button
        onClick={() => setShowWarning(false)}
        className="mt-2 text-xs font-semibold text-orange-500 hover:underline"
      >
        Seguir conectado
      </button>
    </div>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname    = usePathname()
  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  if (isAuthRoute) {
    return <>{children}</>
  }

  return (
    <>
      <SessionManager />
      <Navbar />
      <main className="container mx-auto flex-grow px-4 py-8">{children}</main>
      <Footer />
    </>
  )
}