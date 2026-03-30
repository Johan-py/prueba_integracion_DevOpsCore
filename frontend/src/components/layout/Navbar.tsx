'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import Logo from '../navbar/Logo'
import NavLinks from '../navbar/NavLinks'
import UserMenu from '../navbar/UserMenu'
import LogoutModal from '../navbar/LogoutModal'
import { useNotifications } from '@/hooks/useNotifications'

export type User = {
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

  const {
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
    setIsLoggedIn,
  } = useNotifications()

  const unreadCount = notifications.filter((n) => n.status === 'no leida').length

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
      <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-[#F9F6EE] shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-10">
              <Logo />
              <NavLinks />
            </div>

            <div className="flex items-center gap-4">
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={toggleNotifications}
                  className="relative rounded-full p-2 transition hover:bg-gray-100"
                  aria-label="Abrir notificaciones"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {open && (
                  <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <h3 className="text-sm font-semibold text-gray-800">Notificaciones</h3>
                    </div>

                    {!isLoggedIn ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-gray-500">
                          Inicia sesión para recibir notificaciones
                        </p>
                        <div className="mt-3 flex justify-center">
                          <button
                            type="button"
                            onClick={() => setIsLoggedIn(true)}
                            className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                          >
                            Iniciar sesión
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-2 border-b border-gray-100 px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setFilter('todas')}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                              filter === 'todas'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Todas
                          </button>
                          <button
                            type="button"
                            onClick={() => setFilter('leida')}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                              filter === 'leida'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Leídas
                          </button>
                          <button
                            type="button"
                            onClick={() => setFilter('no leida')}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                              filter === 'no leida'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            No leídas
                          </button>
                          <button
                            type="button"
                            onClick={() => setFilter('archivada')}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                              filter === 'archivada'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Archivadas
                          </button>
                        </div>

                        <div
                          className="max-h-80 overflow-y-auto"
                          onScroll={(e) => {
                            const target = e.currentTarget
                            const reachedBottom =
                              target.scrollTop + target.clientHeight >= target.scrollHeight - 10

                            if (reachedBottom) {
                              loadMoreNotifications()
                            }
                          }}
                        >
                          {filteredNotifications.length === 0 ? (
                            <p className="px-4 py-6 text-center text-sm text-gray-500">
                              No hay notificaciones
                            </p>
                          ) : (
                            <>
                              {visibleNotifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  onClick={() => {
                                    if (notification.status !== 'archivada') {
                                      markAsRead(notification.id)
                                    }
                                  }}
                                  className={`cursor-pointer border-b border-gray-100 px-4 py-3 transition hover:bg-gray-50 ${
                                    notification.status === 'no leida'
                                      ? 'bg-blue-50'
                                      : 'bg-white'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-gray-800">
                                      {notification.title?.trim() || '(Sin título)'}
                                    </p>
                                    <span className="text-[10px] uppercase text-gray-400">
                                      {notification.status}
                                    </span>
                                  </div>

                                  <p className="mt-1 text-sm text-gray-600">
                                    {notification.description?.trim() ||
                                      '(Sin descripción disponible)'}
                                  </p>

                                  {notification.status !== 'archivada' && (
                                    <div className="mt-2 flex justify-end">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          archiveNotification(notification.id)
                                        }}
                                        className="text-xs text-gray-400 transition hover:text-gray-600"
                                      >
                                        Archivar
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}

                              {visibleNotifications.length < filteredNotifications.length && (
                                <p className="px-4 py-3 text-center text-xs text-gray-400">
                                  Cargando más notificaciones...
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        <div className="border-t border-gray-100 px-4 py-3 text-center">
                          <Link
                            href="/notificaciones"
                            className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                          >
                            Ver todo
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="relative" ref={panelRef}>
                <UserMenu
                  user={user}
                  isPanelOpen={isPanelOpen}
                  onTogglePanel={togglePanel}
                  onClosePanel={() => setIsPanelOpen(false)}
                  onLogin={handleLoginMock}
                  onOpenLogoutModal={handleOpenLogoutModal}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <LogoutModal
        show={showLogoutModal}
        isLoggingOut={isLoggingOut}
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />
    </>
  )
}