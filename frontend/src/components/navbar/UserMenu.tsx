import Link from 'next/link'
import type { User } from '../layout/Navbar'
import { User as UserIcon, Eye, FileText, Map, ArrowLeftRight } from 'lucide-react'

type UserMenuProps = {
  user: User | null
  isPanelOpen: boolean
  onTogglePanel: () => void
  onClosePanel: () => void
  onLogin: () => void
  onOpenLogoutModal: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const MenuLink = ({
  label,
  href,
  onClick,
  icon: Icon
}: {
  label: string
  href: string
  onClick: () => void
  icon: any
}) => (
  <Link
    href={href}
    onClick={onClick}
    className="flex items-center gap-3 py-2 px-2 text-gray-500 text-sm hover:bg-black/5 hover:text-[#E68B25] transition-colors rounded"
  >
    <Icon size={18} strokeWidth={1.5} />
    {label}
  </Link>
)

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
        className="p-2 text-gray-700 rounded-full hover:bg-black/5 transition focus:outline-none"
        aria-label="Abrir menú de usuario"
      >
        {user?.avatar ? (
          <img
            src={user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`}
            alt={user.name}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )}
      </button>

      <div
        className={`absolute right-0 mt-3 w-72 rounded-xl border border-gray-200 bg-[#F9F6EE] shadow-lg p-5 z-50 transition-all duration-200 ${isPanelOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible pointer-events-none'}`}
      >
        <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
          <span className="font-bold text-sm text-gray-900">Bienvenido a PropBol</span>
          <button
            onClick={onClosePanel}
            className="text-gray-500 hover:text-black"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {user ? (
          <>
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden border border-gray-100">
                {user.avatar ? (
                  <img
                    src={user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-gray-800 text-sm leading-tight">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-col mb-4">
              <MenuLink label="Mi cuenta" href="/profile" icon={UserIcon} onClick={onClosePanel} />
              {/* ✅ Se mantienen ambas opciones: la nueva y la existente */}
              <MenuLink
                label="Mis propiedades vistas"
                href="/vistas"
                icon={Eye}
                onClick={onClosePanel}
              />
              <MenuLink
                label="Mis publicaciones"
                href="/mis-publicaciones"
                icon={FileText}
                onClick={onClosePanel}
              />
              <MenuLink label="Mis zonas" href="/zonas" icon={Map} onClick={onClosePanel} />
              <MenuLink
                label="Mis comparaciones"
                href="/mis-comparaciones"
                icon={FileText}
                onClick={onClosePanel}
              />
            </div>

            <button
              onClick={onOpenLogoutModal}
              className="w-full bg-[#E68B25] text-white py-2 rounded-lg font-bold hover:bg-[#cf7b1f] transition text-sm shadow-sm"
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <div className="text-center py-2 flex flex-col items-center">
            <p className="text-sm text-gray-600 mb-5">Encuentra tu hogar ideal hoy mismo.</p>
            <button
              onClick={onLogin}
              className="w-full bg-[#E68B25] text-white py-2.5 rounded-xl text-sm font-bold shadow-md"
            >
              Ingresar / Registrarse
            </button>
          </div>
        )}
      </div>
    </>
  )
}