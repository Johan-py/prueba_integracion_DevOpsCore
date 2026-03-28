'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type User = {
  name: string
  email: string
}

const USER_STORAGE_KEY = 'propbol_user'
const SESSION_EXPIRES_KEY = 'propbol_session_expires'
const SESSION_DURATION_MS = 60 * 60 * 1000 // 1 hora

export default function Navbar() {
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement | null>(null)

  const [user, setUser] = useState<User | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const clearSession = () => {
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(SESSION_EXPIRES_KEY)
    setUser(null)
    setIsPanelOpen(false)
    setShowLogoutModal(false)
  }

  const isSessionExpired = () => {
    const expiresAt = localStorage.getItem(SESSION_EXPIRES_KEY)
    if (!expiresAt) return true
    return Date.now() > Number(expiresAt)
  }

  const restoreSession = () => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY)
    const expiresAt = localStorage.getItem(SESSION_EXPIRES_KEY)

    if (!savedUser || !expiresAt) {
      clearSession()
      return
    }

    if (Date.now() > Number(expiresAt)) {
      clearSession()
      return
    }

    setUser(JSON.parse(savedUser))
  }

  useEffect(() => {
    restoreSession()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!panelRef.current) return

      if (!panelRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (user && isSessionExpired()) {
        clearSession()
        router.push('/')
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [user, router])

  const togglePanel = () => {
    if (user && isSessionExpired()) {
      clearSession()
      router.push('/')
      return
    }

    setIsPanelOpen(!isPanelOpen)
  }

  const handleLoginMock = () => {
    const mockUser: User = {
      name: 'Juan Perez',
      email: 'juan.perez@gmail.com',
    }

    const expiresAt = Date.now() + SESSION_DURATION_MS

    setUser(mockUser)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser))
    localStorage.setItem(SESSION_EXPIRES_KEY, String(expiresAt))
  }

  const handleOpenLogoutModal = () => {
    setShowLogoutModal(true)
  }

  const handleCancelLogout = () => {
    if (isLoggingOut) return
    setShowLogoutModal(false)
  }

  const handleConfirmLogout = () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    setTimeout(() => {
      clearSession()
      setIsLoggingOut(false)
      router.push('/')
    }, 400)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-xl font-bold text-blue-600 hover:text-blue-700 transition"
            >
              PropBol
            </Link>

            <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
              <Link href="/" className="hover:text-blue-600 transition">
                Inicio
              </Link>
              <Link href="#contacto" className="hover:text-blue-600 transition">
                Contáctanos
              </Link>
              <Link href="#nosotros" className="hover:text-blue-600 transition">
                Sobre Nosotros
              </Link>
            </div>

            <div className="relative" ref={panelRef}>
              <button
                onClick={togglePanel}
                className="bg-gray-100 px-4 py-2 rounded-xl font-semibold text-gray-700 shadow-sm hover:bg-gray-200 hover:shadow transition duration-200"
              >
                Usuario
              </button>

              <div
                className={`absolute right-0 mt-3 w-64 rounded-2xl border bg-white shadow-xl p-4 z-50 transition-all duration-200 ${
                  isPanelOpen
                    ? 'opacity-100 translate-y-0 visible'
                    : 'opacity-0 -translate-y-2 invisible pointer-events-none'
                }`}
              >
                {user ? (
                  <>
                    <p className="font-bold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500 mb-4">{user.email}</p>

                    <Link
                      href="/perfil"
                      className="block text-blue-600 font-medium mb-4 hover:text-blue-700 transition"
                      onClick={() => setIsPanelOpen(false)}
                    >
                      Mi perfil
                    </Link>

                    <button
                      onClick={handleOpenLogoutModal}
                      className="w-full bg-[#e83017] text-white py-2 rounded-xl font-bold shadow-md hover:opacity-90 transition"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLoginMock}
                    className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition"
                  >
                    Ingresar / Registrarse
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/40 transition-opacity duration-200 ${
          showLogoutModal ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div
          className={`bg-white w-[360px] rounded-2xl shadow-xl px-6 py-5 transition-all duration-200 ${
            showLogoutModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2'
          }`}
        >
          <h2 className="text-[18px] font-bold text-gray-900 mb-2">
            ¿Cerrar Sesión?
          </h2>

          <p className="text-sm text-gray-500 mb-5">
            Se finalizará tu sesión actual en este dispositivo.
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancelLogout}
              disabled={isLoggingOut}
              className="px-5 py-2 rounded-lg bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>

            <button
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
              className="px-5 py-2 rounded-lg bg-[#ff0050] text-white font-semibold shadow-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}