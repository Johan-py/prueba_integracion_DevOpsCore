'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const togglePanel = () => setIsPanelOpen(!isPanelOpen)

  const handleLoginMock = () => {
    setUser({ name: 'Juan Perez', email: 'juan.perez@gmail.com' })
  }

  const handleOpenLogoutModal = () => {
    setShowLogoutModal(true)
  }

  const handleCancelLogout = () => {
    setShowLogoutModal(false)
  }

  const handleConfirmLogout = () => {
    setUser(null)
    setIsPanelOpen(false)
    setShowLogoutModal(false)
  }

  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              PropBol
            </Link>

            <div className="space-x-4">
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

            <div className="relative">
              <button
                onClick={togglePanel}
                className="bg-gray-200 px-3 py-2 rounded-md font-semibold"
              >
                Usuario
              </button>

              {isPanelOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border shadow-lg p-4 z-50 rounded-xl">
                  {user ? (
                    <>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-sm text-gray-500 mb-3">{user.email}</p>

                      <Link href="/perfil" className="block text-blue-600 mb-3">
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
                      className="w-full bg-blue-600 text-white py-2 rounded"
                    >
                      Ingresar / Registrarse
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <div className="bg-white w-[360px] rounded-2xl shadow-xl px-6 py-5">
            <h2 className="text-[18px] font-bold text-gray-900 mb-2">
              ¿Cerrar Sesión?
            </h2>

            <p className="text-sm text-gray-500 mb-5">
              Se finalizará tu sesión actual en este dispositivo.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelLogout}
                className="px-5 py-2 rounded-lg bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmLogout}
                className="px-5 py-2 rounded-lg bg-[#ff0050] text-white font-semibold shadow-sm hover:opacity-90 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}