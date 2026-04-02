import Link from 'next/link'
import type { User } from '../layout/Navbar'

type UserMenuProps = {
  user: User | null
  isPanelOpen: boolean
  onTogglePanel: () => void
  onClosePanel: () => void
  onLogin: () => void
  onOpenLogoutModal: () => void
}

export default function UserMenu({
  user,
  isPanelOpen,
  onTogglePanel,
  onClosePanel,
  onLogin,
  onOpenLogoutModal
}: UserMenuProps) {
  return (
    <>
      <button
        onClick={onTogglePanel}
        className="p-2 text-gray-700 rounded-full hover:bg-black/5 hover:shadow-sm transition duration-200 focus:outline-none"
        aria-label="Menú de usuario"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </button>

      <div
        className={`absolute right-0 mt-3 w-72 rounded-xl border border-gray-200 bg-[#F9F6EE] shadow-lg p-5 z-50 transition-all duration-200 ${
          isPanelOpen
            ? 'opacity-100 translate-y-0 visible'
            : 'opacity-0 -translate-y-2 invisible pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
          <span className="font-bold text-sm text-gray-900">Bienvenido a PropBol</span>
          <button
            onClick={onClosePanel}
            className="text-gray-500 hover:text-black hover:bg-black/5 rounded px-2 py-1 transition"
          >
            ✕
          </button>
        </div>

        {user ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.name.charAt(0)}
              </div>

              <div>
                <p className="font-bold text-gray-800 text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>

            <Link
              href="/perfil"
              className="flex justify-between w-full text-black font-bold mb-4 hover:bg-black/5 p-2 rounded transition text-sm"
              onClick={onClosePanel}
            >
              Mi perfil <span>&gt;</span>
            </Link>

            <button
              onClick={onOpenLogoutModal}
              className="w-full bg-[#E68B25] text-white py-2 rounded-lg font-bold shadow-sm hover:bg-[#cf7b1f] transition text-sm"
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <div className="text-center py-2 flex flex-col items-center">
            <div className="w-12 h-12 bg-[#E68B25]/10 rounded-full flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-[#E68B25]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <p className="text-sm text-gray-600 mb-5 px-2">Encuentra tu hogar ideal hoy mismo.</p>

            <button
              onClick={onLogin}
              className="w-full bg-[#E68B25] text-white py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#cf7b1f] transition-all active:scale-95"
            >
              Ingresar / Registrarse
            </button>
          </div>
        )}
      </div>
    </>
  )
}
