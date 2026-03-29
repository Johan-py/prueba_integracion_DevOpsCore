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
      <nav className="sticky top-0 z-40 bg-[#F9F6EE]/85 backdrop-blur-md border-b border-gray-200/60 shadow-sm w-full transition-all duration-300">
        <div className="container mx-auto px-4 md:px-8 py-3.5">
          <div className="flex justify-between items-center">
            
            {/* Logo Profesional */}
            <Link
              href="/"
              className="flex items-center gap-3 text-2xl font-extrabold text-gray-900 tracking-tight group"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-gray-900 rounded-xl shadow-md group-hover:shadow-lg group-hover:-translate-y-0.5 transition-all duration-300">
                <svg className="w-5 h-5 text-[#F9F6EE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              Prop<span className="text-[#ff0050]">Bol</span>
            </Link>

            {/* Menú de Navegación */}
            <div className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-gray-600">
              <Link href="/" className="relative group py-2">
                <span className="group-hover:text-gray-900 transition-colors duration-300">Inicio</span>
                <span className="absolute left-0 bottom-0 w-full h-[2.5px] bg-[#ff0050] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></span>
              </Link>
              
              <Link href="#contacto" className="relative group py-2">
                <span className="group-hover:text-gray-900 transition-colors duration-300">Contáctanos</span>
                <span className="absolute left-0 bottom-0 w-full h-[2.5px] bg-[#ff0050] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></span>
              </Link>
              
              <Link href="#nosotros" className="relative group py-2">
                <span className="group-hover:text-gray-900 transition-colors duration-300">Sobre Nosotros</span>
                <span className="absolute left-0 bottom-0 w-full h-[2.5px] bg-[#ff0050] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></span>
              </Link>
            </div>

            {/* Icono de Usuario y Panel */}
            <div className="relative" ref={panelRef}>
              <button
                onClick={togglePanel}
                className="flex items-center justify-center p-2.5 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 hover:shadow-md hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20"
                aria-label="Menú de usuario"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </button>

              {/* Modal/Dropdown Mejorado */}
              <div
                className={`absolute right-0 mt-3 w-80 rounded-2xl border border-gray-200 bg-[#F9F6EE] shadow-2xl p-5 z-50 origin-top-right transition-all duration-300 ${
                  isPanelOpen
                    ? 'opacity-100 scale-100 visible'
                    : 'opacity-0 scale-95 invisible pointer-events-none'
                }`}
              >
                {/* Cabecera del Dropdown */}
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
                  <span className="font-bold text-sm text-gray-800">Bienvenido a PropBol</span>
                  <button 
                    onClick={() => setIsPanelOpen(false)} 
                    className="text-gray-400 hover:text-gray-800 hover:bg-black/5 p-1 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                {user ? (
                  <>
                    <div className="flex items-center gap-3 mb-5 p-2 bg-white/50 rounded-xl border border-gray-100 shadow-sm">
                      <div className="w-11 h-11 bg-gradient-to-tr from-gray-800 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm leading-tight">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>

                    <Link
                      href="/perfil"
                      className="group flex justify-between w-full text-black font-bold mb-4 hover:shadow-sm p-2 rounded-lg transition text-sm hover:bg-white"
                      onClick={() => setIsPanelOpen(false)}
                    >
                      Mi perfil <span className="text-gray-400 group-hover:text-black transition-colors">&gt;</span>
                    </Link>

                    <button
                      onClick={handleOpenLogoutModal}
                      className="w-full bg-[#ff0050] text-white py-2.5 rounded-xl font-bold shadow-md hover:bg-[#e60048] hover:shadow-lg transition-all active:scale-95 text-sm"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center py-2 px-1">
                    <div className="w-12 h-12 bg-[#ff0050]/10 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-[#ff0050]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    
                    <p className="text-sm text-gray-600 text-center mb-5 font-medium px-2">
                      Encuentra tu hogar ideal o publica tu inmueble hoy mismo.
                    </p>
                    
                    <button
                      onClick={handleLoginMock}
                      className="group flex items-center justify-center gap-2 w-full bg-[#ff0050] text-white py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#e60048] hover:shadow-lg transition-all active:scale-95"
                    >
                      <span>Ingresar / Registrarse</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal de Confirmación de Cierre de Sesión */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          showLogoutModal ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div
          className={`bg-[#F9F6EE] w-[360px] rounded-3xl shadow-2xl px-6 py-6 text-center transition-all duration-300 ${
            showLogoutModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
        >
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
             <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
             </svg>
          </div>
          
          <h2 className="text-[18px] font-bold text-gray-900 mb-2">
            ¿Cerrar Sesión?
          </h2>

          <p className="text-sm text-gray-600 mb-6 px-2">
            Se finalizará tu sesión actual en este dispositivo. Tendrás que volver a ingresar tus datos la próxima vez.
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleCancelLogout}
              disabled={isLoggingOut}
              className="flex-1 py-2.5 rounded-xl bg-gray-200 text-gray-800 font-bold hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
              className="flex-1 py-2.5 rounded-xl bg-[#ff0050] text-white font-bold shadow-md hover:bg-[#e60048] hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoggingOut ? 'Cerrando...' : 'Salir'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}