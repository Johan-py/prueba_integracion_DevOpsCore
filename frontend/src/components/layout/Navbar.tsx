"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Archive,
  Bell,
  CheckCheck,
  Loader2,
  Menu,
  Trash2,
  WifiOff,
  Settings,
  X,
  ChevronDown,
} from "lucide-react";

import Logo from "../navbar/Logo";
import NavLinks from "../navbar/NavLinks";
import UserMenu from "../navbar/UserMenu";
import LogoutModal from "../navbar/LogoutModal";
import { useNotifications } from "@/hooks/useNotifications";
import { buildSessionUser, USER_STORAGE_KEY } from "@/lib/session";
import type { NotificationFilter } from "@/types/notification";
import ThemeToggleButton from "./ThemeToggleButton";

export type User = {
  name: string;
  email: string;
  avatar?: string | null;
  role?: string | null;
};

type MeResponse = {
  message?: string;
  user?: {
    id: number;
    nombre?: string;
    apellido?: string;
    correo: string;
    avatar?: string | null;
    rol?: string;
  };
};

class SessionValidationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "SessionValidationError";
    this.statusCode = statusCode;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const SESSION_EXPIRES_KEY = "propbol_session_expires";
const AUTH_SYNC_EVENT_KEY = "propbol_auth_sync";

const filters: NotificationFilter[] = [
  "todas",
  "leida",
  "no leida",
  "archivada",
];

const notifyAuthSync = (type: "logout") => {
  localStorage.setItem(
    AUTH_SYNC_EVENT_KEY,
    JSON.stringify({
      type,
      timestamp: Date.now(),
    }),
  );
};

export default function Navbar() {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const notificationPanelRef = useRef<HTMLDivElement | null>(null);
  const [, setTick] = useState(0);

  const [user, setUser] = useState<User | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPropiedadesOpen, setIsPropiedadesOpen] = useState(false);

  const {
    open,
    filter,
    visibleNotifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    error,
    isOnline,
    hasRealtimeUpdate,
    scrollContainerRef,
    saveScrollPosition,
    toggleNotifications,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    loadMoreNotifications,
    hasMore,
    refreshNotifications,
    isLoggedIn,
    setIsLoggedIn,
  } = useNotifications();

  const clearSession = useCallback(
    (emitEvent = true) => {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(SESSION_EXPIRES_KEY);
      localStorage.removeItem("token");
      localStorage.removeItem("nombre");
      localStorage.removeItem("correo");
      localStorage.removeItem("avatar");
      localStorage.removeItem("controlador");
      localStorage.removeItem("searchHistory");

      setUser(null);
      setIsPanelOpen(false);
      setShowLogoutModal(false);
      setIsLoggedIn(false);

      if (emitEvent) {
        notifyAuthSync("logout");
        window.dispatchEvent(new Event("propbol:session-changed"));
        window.dispatchEvent(new Event("auth-state-changed"));
      }
    },
    [setIsLoggedIn],
  );

  const isSessionExpired = () => {
    const expiresAt = localStorage.getItem(SESSION_EXPIRES_KEY);
    if (!expiresAt) return true;
    return Date.now() > Number(expiresAt);
  };

  const fetchCurrentUser = async (token: string) => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = (await response.json()) as MeResponse;

    if (!response.ok || !data.user) {
      throw new SessionValidationError(
        data.message || "Sesión inválida o expirada",
        response.status,
      );
    }

    return data.user;
  };

  const restoreSession = useCallback(async () => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    const expiresAt = localStorage.getItem(SESSION_EXPIRES_KEY);
    const token = localStorage.getItem("token");

    if (!savedUser || !expiresAt || !token) {
      clearSession(false);
      return;
    }

    if (Date.now() > Number(expiresAt)) {
      clearSession(false);
      return;
    }

    let parsedUser: User;

    try {
      parsedUser = JSON.parse(savedUser) as User;
    } catch {
      clearSession(false);
      return;
    }

    if (!navigator.onLine) {
      setUser(parsedUser);
      setIsLoggedIn(true);
      return;
    }

    try {
      const validatedUser = await fetchCurrentUser(token);
      const finalUser: User = buildSessionUser(validatedUser);

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(finalUser));
      localStorage.setItem("nombre", finalUser.name);
      localStorage.setItem("correo", finalUser.email);
      localStorage.setItem("avatar", finalUser.avatar ?? "");

      setUser(finalUser);
      setIsLoggedIn(true);
    } catch (error) {
      if (
        error instanceof SessionValidationError &&
        (error.statusCode === 401 || error.statusCode === 403)
      ) {
        clearSession(false);
        return;
      }

      setUser(parsedUser);
      setIsLoggedIn(true);
    }
  }, [clearSession, setIsLoggedIn]);

  const formatRelativeTime = (fecha: string | null): string => {
    if (!fecha) return "";
    const diff = Date.now() - new Date(fecha).getTime();
    const mins = Math.floor(diff / 60000);

    if (mins < 1) return "hace un momento";
    if (mins < 60) return `hace ${mins} min`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours} h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `hace ${days} d`;

    return new Date(fecha).toLocaleDateString("es-BO", {
      day: "numeric",
      month: "short",
    });
  };

  // Tick para forzar re-render cada minuto (timestamps relativos)
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Restaurar sesión y escuchar cambios entre pestañas
  useEffect(() => {
    void restoreSession();

    const handleSessionChange = () => void restoreSession();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AUTH_SYNC_EVENT_KEY && event.newValue) {
        try {
          const payload = JSON.parse(event.newValue) as { type?: string };

          if (payload.type === "logout") {
            clearSession(false);
            return;
          }
        } catch {
          void restoreSession();
          return;
        }
      }

      if (event.key === "token" && event.newValue === null) {
        clearSession(false);
        return;
      }

      void restoreSession();
    };

    const handleOnline = () => void restoreSession();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("propbol:login", handleSessionChange);
    window.addEventListener("propbol:session-changed", handleSessionChange);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("propbol:login", handleSessionChange);
      window.removeEventListener(
        "propbol:session-changed",
        handleSessionChange,
      );
      window.removeEventListener("online", handleOnline);
    };
  }, [clearSession, restoreSession]);

  // Cerrar paneles al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsPanelOpen(false);
      }
      if (
        notificationPanelRef.current &&
        !notificationPanelRef.current.contains(event.target as Node) &&
        open
      ) {
        toggleNotifications();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, toggleNotifications]);

  // Verificar expiración de sesión cada 10 segundos (una sola instancia)
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && isSessionExpired()) {
        clearSession();
        router.push("/");
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user, router, clearSession]);

  // Cerrar panel de notificaciones con Escape
  useEffect(() => {
    if (!open) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") toggleNotifications();
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, toggleNotifications]);

  // Escuchar eventos para abrir/cerrar menú móvil desde el tour
  useEffect(() => {
    const abrir = () => setIsMobileMenuOpen(true);
    const cerrar = () => setIsMobileMenuOpen(false);
    window.addEventListener("propbol:abrir-menu-movil", abrir);
    window.addEventListener("propbol:cerrar-menu-movil", cerrar);
    return () => {
      window.removeEventListener("propbol:abrir-menu-movil", abrir);
      window.removeEventListener("propbol:cerrar-menu-movil", cerrar);
    };
  }, []);

  const togglePanel = () => {
    if (user && isSessionExpired()) {
      clearSession();
      router.push("/");
      return;
    }
    setIsPanelOpen((prev) => !prev);
  };

  const handleLoginRedirect = () => router.push("/sign-in");
  const handleOpenLogoutModal = () => {
    setShowLogoutModal(true);
    setIsPanelOpen(false);
  };

  const handleCancelLogout = () => {
    if (isLoggingOut) return;
    setShowLogoutModal(false);
  };

  const handleConfirmLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    const token = localStorage.getItem("token");

    if (token) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn("Error al cerrar sesión en el servidor:", err);
      }
    }

    clearSession();
    setIsLoggingOut(false);
    router.push("/");
  };

  // Lanzar el tour: si ya estamos en "/", disparar evento directo;
  // si no, navegar primero y esperar a que el componente monte.
  const handleIniciarTour = () => {
    setIsMobileMenuOpen(false);
    if (window.location.pathname === "/") {
      window.dispatchEvent(new Event("propbol:iniciar-tour"));
    } else {
      router.push("/");
      setTimeout(() => {
        window.dispatchEvent(new Event("propbol:iniciar-tour"));
      }, 600);
    }
  };
  const handlePublicarInmueble = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      const meResponse = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const meData = (await meResponse.json()) as MeResponse;

      if (!meResponse.ok || !meData.user?.id) {
        console.error("No se pudo obtener usuario autenticado");
        router.push("/sign-in");
        return;
      }

      const limiteResponse = await fetch(
        `${API_URL}/api/publicaciones/validar-limite/${meData.user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const limiteData = await limiteResponse.json();

      if (
        limiteResponse.ok &&
        (limiteData.message === "LIMIT_REACHED" || Number(limiteData.restantes) <= 0)
      ) {
        router.push("/Cobros-Limite");
        return;
      }

      router.push("/registro-inmueble");
    } catch (error) {
      console.error("Error validando publicaciones:", error);
      router.push("/registro-inmueble");
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-[999] w-full border-b border-stone-200 dark:border-stone-700 bg-[#F9F6EE] dark:bg-stone-900 shadow-sm">
        <div className="mx-auto max-w-[1440px] px-4 py-1.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-10">
              <Logo />
              <NavLinks />
            </div>

            <div className="flex items-center gap-4">
              <button
                id="tour-publicar-home"
                type="button"
                onClick={handlePublicarInmueble}
                className="hidden md:block rounded-md bg-[#E68B25] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700"
              >
                Publica tu inmueble
              </button>

              {/* HU13: botón general para alternar modo claro/oscuro */}
              <div className="hidden md:block">
                <ThemeToggleButton />
              </div>

              <div className="relative" ref={notificationPanelRef}>
                <button
                  id="tour-notificaciones"
                  type="button"
                  onClick={toggleNotifications}
                  aria-label="Abrir notificaciones"
                  aria-haspopup="true"
                  aria-expanded={open}
                  className="relative rounded-full p-2 transition duration-200 hover:bg-black/5 hover:shadow-sm"
                >
                  <Bell className="h-6 w-6 text-stone-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-600 px-1 text-xs font-semibold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {open && (
                  <div
                    role="dialog"
                    aria-label="Panel de notificaciones"
                    aria-modal="true"
                    className="fixed left-0 right-0 top-[41px] z-50 mx-2 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-10 sm:mx-0 sm:w-80"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                      <h3 className="text-sm font-semibold text-stone-900">
                        Notificaciones
                      </h3>
                      {isLoggedIn && (
                        <div className="flex items-center gap-2">
                          <Link
                            href="/configuracion/notificaciones"
                            onClick={toggleNotifications}
                            aria-label="Configuración de notificaciones"
                            className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-700"
                          >
                            <Settings className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => void markAllAsRead()}
                            disabled={!isOnline}
                            className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 transition hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <CheckCheck className="h-4 w-4" />
                            Marcar todas
                          </button>
                        </div>
                      )}
                    </div>

                    {!isOnline && (
                      <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50 px-4 py-2 text-xs text-stone-500">
                        <WifiOff className="h-3 w-3 shrink-0" />
                        <span>
                          Sin conexión. Se actualizará al reconectarte.
                        </span>
                      </div>
                    )}

                    {!isLoggedIn ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-stone-500">
                          Inicia sesión para recibir notificaciones
                        </p>
                        <div className="mt-3 flex justify-center">
                          <button
                            type="button"
                            onClick={handleLoginRedirect}
                            className="rounded-full bg-amber-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700"
                          >
                            Iniciar sesión
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          role="tablist"
                          aria-label="Filtros de notificaciones"
                          className="flex flex-wrap gap-2 border-b border-stone-100 px-4 py-3"
                        >
                          {filters.map((item) => (
                            <button
                              key={item}
                              type="button"
                              role="tab"
                              aria-selected={filter === item}
                              onClick={() => setFilter(item)}
                              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                filter === item
                                  ? "bg-amber-600 text-white"
                                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                              }`}
                            >
                              {item === "todas"
                                ? "Todas"
                                : item === "leida"
                                  ? "Leídas"
                                  : item === "no leida"
                                    ? "No leídas"
                                    : "Archivadas"}
                            </button>
                          ))}
                        </div>

                        <div
                          ref={scrollContainerRef}
                          role="list"
                          aria-label="Lista de notificaciones"
                          aria-live="polite"
                          className="max-h-[60vh] overflow-y-auto sm:max-h-80"
                          onScroll={(e) => {
                            const target = e.currentTarget;
                            saveScrollPosition(target.scrollTop);
                            const reachedBottom =
                              target.scrollTop + target.clientHeight >=
                              target.scrollHeight - 20;
                            if (reachedBottom && hasMore && !isLoadingMore) {
                              void loadMoreNotifications();
                            }
                          }}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-stone-500">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Cargando notificaciones...
                            </div>
                          ) : error && isOnline ? (
                            <div className="px-4 py-6 text-center">
                              <p className="text-sm text-red-500">{error}</p>
                              <button
                                type="button"
                                onClick={() =>
                                  void refreshNotifications(filter)
                                }
                                className="mt-3 rounded border border-stone-300 px-3 py-1 text-sm text-stone-700 transition hover:bg-stone-50"
                              >
                                Reintentar
                              </button>
                            </div>
                          ) : visibleNotifications.length === 0 ? (
                            <p
                              role="status"
                              className="px-4 py-6 text-center text-sm text-stone-500"
                            >
                              No hay notificaciones
                            </p>
                          ) : (
                            <>
                              {visibleNotifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  role="listitem"
                                  onClick={() => {
                                    if (
                                      notification.status === "no leida" &&
                                      isOnline
                                    ) {
                                      void markAsRead(notification.id);
                                    }
                                    toggleNotifications();
                                    if (notification.tipo === "BLOG_APROBADO" && notification.blogId) {
                                      router.push(`/blog/${notification.blogId}`);
                                    } else if (notification.tipo === "BLOG_RECHAZADO" && notification.blogId) {
                                      router.push(`/blog/${notification.blogId}/edit`);
                                    } else {
                                      router.push(`/notificaciones/${notification.id}`);
                                    }
                                  }}
                                  className={`cursor-pointer border-b border-stone-100 px-4 py-3 transition hover:bg-stone-50 ${
                                    notification.status === "no leida"
                                      ? "bg-amber-50"
                                      : "bg-white"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        {notification.status === "no leida" && (
                                          <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                                        )}
                                        <p className="truncate text-sm font-semibold text-stone-900">
                                          {notification.title?.trim() ||
                                            "(Sin título)"}
                                        </p>
                                      </div>

                                      <p className={`mt-1 line-clamp-2 text-sm ${notification.tipo === "BLOG_RECHAZADO" ? "text-red-600" : "text-stone-600"}`}>
                                        {notification.description?.trim() ||
                                          "(Sin descripción disponible)"}
                                      </p>

                                      <div className="mt-2 flex flex-wrap items-center gap-2">
                                        {notification.tipo ===
                                          "BLOG_APROBADO" && (
                                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                            Aprobado
                                          </span>
                                        )}
                                        {notification.tipo ===
                                          "BLOG_RECHAZADO" && (
                                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                                            Rechazado
                                          </span>
                                        )}
                                        {notification.tipo ===
                                          "BLOG_PENDIENTE" && (
                                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                            Pendiente
                                          </span>
                                        )}
                                        <span className="text-[10px] uppercase text-stone-400">
                                          {notification.status}
                                        </span>
                                        <span className="text-[10px] text-stone-400">
                                          ·{" "}
                                          {formatRelativeTime(
                                            notification.fechaCreacion || null,
                                          )}
                                        </span>
                                      </div>
                                    </div>

                                    <div
                                      className="flex shrink-0 items-center gap-2"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {!notification.archivada && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            void archiveNotification(
                                              notification.id,
                                            )
                                          }
                                          aria-label="Archivar notificación"
                                          className="text-stone-400 transition hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                          <Archive className="h-4 w-4" />
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() =>
                                          void deleteNotification(
                                            notification.id,
                                          )
                                        }
                                        disabled={!isOnline}
                                        className="text-xs text-red-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {isLoadingMore && (
                                <p className="px-4 py-3 text-center text-xs text-stone-400">
                                  Cargando más notificaciones...
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        <div className="border-t border-stone-100 px-4 py-3 text-center">
                          <Link
                            href="/notificaciones"
                            onClick={toggleNotifications}
                            className="text-sm font-medium text-amber-600 transition hover:text-amber-700"
                          >
                            Ver todas las notificaciones
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
                  onLogin={handleLoginRedirect}
                  onOpenLogoutModal={handleOpenLogoutModal}
                />
              </div>

              <button
                id="tour-menu-mobile"
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="rounded-full p-2 transition duration-200 hover:bg-black/5 hover:shadow-sm md:hidden"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="h-6 w-6 text-stone-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {hasRealtimeUpdate && (
        <div className="fixed right-4 top-20 z-[9999] rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700 shadow-lg">
          Nueva notificación recibida
        </div>
      )}

      <LogoutModal
        show={showLogoutModal}
        isLoggingOut={isLoggingOut}
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="fixed right-0 top-0 h-full w-4/5 max-w-xs bg-[#F9F6EE] dark:bg-stone-900 p-6 shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full p-2 transition duration-200 hover:bg-black/5"
                aria-label="Cerrar menú"
              >
                <X className="h-6 w-6 text-stone-600" />
              </button>
            </div>

            <nav className="mt-10 flex flex-col gap-2">
              {/* HU13: botón modo claro/oscuro - vistoso, alineado derecha */}
              <div className="px-3 py-3 flex justify-end">
                <div className="bg-orange-100/80 dark:bg-stone-700/80 rounded-full px-4 py-2 shadow-sm border border-orange-200 dark:border-stone-600">
                  <ThemeToggleButton />
                </div>
              </div>

              {/* FIX: agregado id="tour-publicar-home-mobile" que faltaba.
                  Sin este id, el tour no podía encontrar el elemento al
                  retroceder desde "tour-notificaciones" al paso anterior. */}
              <button
                id="tour-publicar-home-mobile"
                onClick={() => {setIsMobileMenuOpen(false);
                void handlePublicarInmueble();
                }}
                className="rounded-md px-3 py-2 text-lg font-bold text-[#E68B25] hover:bg-[#E68B25]/10"
              >
                Publica tu inmueble
              </button>

              <div id="tour-propiedades-mobile" className="flex flex-col">
                <button
                  onClick={() => setIsPropiedadesOpen(!isPropiedadesOpen)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-lg font-medium text-gray-700 dark:text-stone-300 hover:bg-[#E68B25]/10 hover:text-[#E68B25]"
                >
                  <span>Propiedades</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-200 ${isPropiedadesOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`flex flex-col overflow-hidden transition-all duration-300 ${isPropiedadesOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  {[
                    "Casas",
                    "Departamentos",
                    "Cuartos",
                    "Terrenos",
                    "Espacios de cementerios",
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        const tipoMap: Record<string, string> = {
                          Casas: "CASA",
                          Departamentos: "DEPARTAMENTO",
                          Cuartos: "CUARTO",
                          Terrenos: "TERRENO",
                          "Espacios de cementerios": "TERRENO_MORTUORIO",
                        };
                        const tipoFinal = tipoMap[item];
                        const modosFinales = ["VENTA"];
                        const nuevosFiltros = {
                          tipoInmueble: [tipoFinal],
                          modoInmueble: modosFinales,
                          query: "",
                          updatedAt: new Date().toISOString(),
                        };
                        const currentFilters = JSON.parse(
                          sessionStorage.getItem("propbol_global_filters") ||
                            "{}",
                        );
                        sessionStorage.setItem(
                          "propbol_global_filters",
                          JSON.stringify({
                            ...currentFilters,
                            ...nuevosFiltros,
                          }),
                        );
                        const params = new URLSearchParams();
                        modosFinales.forEach((m) =>
                          params.append("modoInmueble", m),
                        );
                        if (tipoFinal) params.set("tipoInmueble", tipoFinal);
                        router.push(`/busqueda_mapa?${params.toString()}`);
                      }}
                      className="pl-8 py-2 text-base text-gray-600 dark:text-stone-400 hover:text-[#E68B25] text-left w-full"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <Link
                id="tour-blogs-mobile"
                href="/blogs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-lg font-medium text-gray-700 dark:text-stone-300 hover:bg-[#E68B25]/10 hover:text-[#E68B25]"
              >
                Blogs
              </Link>

              <Link
                id="tour-planes-mobile"
                href="/cobros-suscripciones"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-lg font-medium text-gray-700 dark:text-stone-300 hover:bg-[#E68B25]/10 hover:text-[#E68B25]"
              >
                Planes de membresía
              </Link>

              <button
                id="tour-ayuda-mobile"
                type="button"
                onClick={handleIniciarTour}
                className="w-full text-left rounded-md px-3 py-2 text-lg font-medium text-gray-700 dark:text-stone-300 hover:bg-[#E68B25]/10 hover:text-[#E68B25]"
              >
                Ayuda
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
