import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import type { User } from "../layout/Navbar";
import { User as UserIcon, Eye, FileText, Map, Star, Shield, LayoutDashboard, CheckCircle } from "lucide-react";

type UserMenuProps = {
  user: User | null;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  onClosePanel: () => void;
  onLogin: () => void;
  onOpenLogoutModal: () => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const MenuLink = ({
  label,
  href,
  onClick,
  icon: Icon,
}: {
  label: string;
  href: string;
  onClick: () => void;
  icon: any;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className="flex items-center gap-3 py-2 px-2 text-gray-500 text-sm hover:bg-black/5 hover:text-[#E68B25] transition-colors rounded"
  >
    <Icon size={18} strokeWidth={1.5} className="flex-shrink-0" />
    <span className="truncate">{label}</span>
  </Link>
);

export default function UserMenu({
  user,
  isPanelOpen,
  onTogglePanel,
  onClosePanel,
  onLogin,
  onOpenLogoutModal,
}: UserMenuProps) {

  // Estado local para manejar los datos del usuario de forma independiente
  const [localUser, setLocalUser] = useState<User | null>(user);

  // Usamos una referencia para saber si acabamos de hacer una actualización local.
  // Esto actúa como un "escudo" temporal contra las props del padre.
  const isLocalUpdateRef = useRef(false);

  // Inicialización segura desde localStorage si está disponible (solo lado del cliente)
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const storedAvatar = localStorage.getItem('avatar');
      const storedName = localStorage.getItem('nombre');
      const storedEmail = localStorage.getItem('correo');

      setLocalUser(prev => ({
        ...user,
        avatar: storedAvatar || user.avatar,
        name: storedName || user.name,
        email: storedEmail || user.email
      }));
    } else {
      setLocalUser(user);
    }
  }, []); // Solo se ejecuta una vez al montar

  // 2. EL "REBELDE": Manejo de las actualizaciones provenientes del padre (Navbar)
  useEffect(() => {
    // Si la última actualización fue local, ignoramos las props del padre por un breve momento
    // para evitar el "parpadeo" mientras el servidor refresca.
    if (isLocalUpdateRef.current) {
      // Reseteamos la bandera después de un breve delay
      const timer = setTimeout(() => {
        isLocalUpdateRef.current = false;
      }, 4000); // Suficiente tiempo para que el router.refresh() termine
      return () => clearTimeout(timer);
    }

    if (user) {
      setLocalUser((prevLocal) => {
        // Para ser extra seguros, incluso si aceptamos la prop del padre, 
        // preferimos el localStorage si existe
        const storedAvatar = typeof window !== 'undefined' ? localStorage.getItem('avatar') : null;
        const storedName = typeof window !== 'undefined' ? localStorage.getItem('nombre') : null;
        const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('correo') : null;

        return {
          ...user,
          avatar: storedAvatar || prevLocal?.avatar || user.avatar,
          name: storedName || prevLocal?.name || user.name,
          email: storedEmail || prevLocal?.email || user.email,
        };
      });
    } else {
      setLocalUser(null);
    }
  }, [user]);

  // 3. LA "ANTENA": Escuchamos los cambios en vivo desde ProfileCard
  useEffect(() => {
    const handleCustomUpdate = (e: any) => {
      if (e.detail && e.detail.key && e.detail.value) {
        // Levantamos el escudo protector
        isLocalUpdateRef.current = true;

        setLocalUser((prev) => {
          if (!prev) return prev;
          const keyMap: Record<string, keyof User> = {
            'avatar': 'avatar',
            'nombre': 'name',
            'correo': 'email'
          };
          const userKey = keyMap[e.detail.key];
          if (userKey) {
            return { ...prev, [userKey]: e.detail.value };
          }
          return prev;
        });
      }
    };

    const handleStorageFallback = () => {
      // Levantamos el escudo protector
      isLocalUpdateRef.current = true;

      setLocalUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          avatar: localStorage.getItem('avatar') || prev.avatar,
          name: localStorage.getItem('nombre') || prev.name,
          email: localStorage.getItem('correo') || prev.email,
        };
      });
    };

    window.addEventListener('profileUpdate', handleCustomUpdate);
    window.addEventListener('profileUpdated', handleStorageFallback);
    // Escuchar también storage por si acaso, aunque CustomEvents son más confiables aquí
    window.addEventListener('storage', handleStorageFallback);

    return () => {
      window.removeEventListener('profileUpdate', handleCustomUpdate);
      window.removeEventListener('profileUpdated', handleStorageFallback);
      window.removeEventListener('storage', handleStorageFallback);
    };
  }, []);

  return (
    <>
      {/* HU-05: ID de referencia para el tour guiado - Paso "Tu cuenta" */}
      {/* Este botón será resaltado para mostrar dónde gestionar perfil y sesión */}
      <button
        id="tour-user"
        onClick={onTogglePanel}
        className="p-2 text-gray-700 rounded-full hover:bg-black/5 transition focus:outline-none"
        aria-label="Abrir menú de usuario"
      >
        {localUser?.avatar ? (
          <img
            src={
              localUser.avatar.startsWith("http")
                ? localUser.avatar
                : `${API_URL}${localUser.avatar}`
            }
            alt={localUser.name}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
        className={`fixed left-1/2 -translate-x-1/2 top-[60px] w-[calc(100vw-2rem)] max-w-[340px] rounded-xl border border-gray-200 bg-[#F9F6EE] shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-5 z-[999] transition-all duration-200 sm:absolute sm:left-auto sm:-translate-x-0 sm:top-auto sm:right-0 sm:mt-3 sm:w-72 ${isPanelOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-4 sm:-translate-y-2 invisible pointer-events-none"}`}
      >
        <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
          <span className="font-bold text-sm text-gray-900">
            Bienvenido a PropBol
          </span>
          <button
            onClick={onClosePanel}
            className="text-gray-500 hover:text-black"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {localUser ? (
          <>
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden border border-gray-100">
                {localUser.avatar ? (
                  <img
                    src={
                      localUser.avatar.startsWith("http")
                        ? localUser.avatar
                        : `${API_URL}${localUser.avatar}`
                    }
                    alt={localUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  localUser.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="font-bold text-gray-800 text-sm leading-tight truncate">
                  {localUser.name}
                </p>
                <p className="text-xs text-gray-500 truncate" title={localUser.email}>
                  {localUser.email}
                </p>
              </div>
            </div>

            <div className="flex flex-col mb-4">
              <MenuLink
                label="Mi cuenta"
                href="/profile"
                icon={UserIcon}
                onClick={onClosePanel}
              />
              <MenuLink
                label="Mis propiedades vistas"
                href="/vistas"
                icon={Eye}
                onClick={onClosePanel}
              />
              <MenuLink
                label="Mis favoritos"
                href="/mis-favoritos"
                icon={Star}
                onClick={onClosePanel}
              />
              <MenuLink
                label="Mis publicaciones"
                href="/mis-publicaciones"
                icon={FileText}
                onClick={onClosePanel}
              />
              <MenuLink
                label="Mis zonas"
                href="/profile/mis-zonas"
                icon={Map}
                onClick={onClosePanel}
              />
              <MenuLink
                label="Mis comparaciones"
                href="/mis-comparaciones"
                icon={FileText}
                onClick={onClosePanel}
              />
              <MenuLink
                label="Sesiones activas"
                href="/profile/sesiones-activas"
                icon={CheckCircle}
                onClick={onClosePanel}
              />
              {/* HU13: acceso a ajustes de visualización y accesibilidad */}
              <MenuLink
                label="Ajustes de Visualización"
                href="/profile/ajustes-visualizacion"
                icon={Eye}
                onClick={onClosePanel}
              />
              <MenuLink
                label="Seguridad"
                href="/profile/security"
                icon={Shield}
                onClick={onClosePanel}
              />
              {user?.role === "ADMIN" && (
                <MenuLink
                  label="Panel de Administrador"
                  href="/admin"
                  icon={LayoutDashboard}
                  onClick={onClosePanel}
                />
              )}
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
            <p className="text-sm text-gray-600 mb-5">
              Encuentra tu hogar ideal hoy mismo.
            </p>
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
  );
}