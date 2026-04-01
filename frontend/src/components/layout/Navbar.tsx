"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCheck, Loader2, Trash2, WifiOff } from "lucide-react";

import Logo from "../navbar/Logo";
import NavLinks from "../navbar/NavLinks";
import UserMenu from "../navbar/UserMenu";
import LogoutModal from "../navbar/LogoutModal";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationFilter } from "@/types/notification";

export type User = {
  name: string;
  email: string;
};

const USER_STORAGE_KEY = "propbol_user";
const SESSION_EXPIRES_KEY = "propbol_session_expires";
const SESSION_DURATION_MS = 60 * 60 * 1000;

const filters: NotificationFilter[] = ["todas", "leida", "no leida"];

export default function Navbar() {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    open,
    filter,
    visibleNotifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    error,
    isOnline,
    notificationRef,
    toggleNotifications,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMoreNotifications,
    hasMore,
    refreshNotifications,
    isLoggedIn,
    setIsLoggedIn,
  } = useNotifications();

  const clearSession = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(SESSION_EXPIRES_KEY);
    localStorage.removeItem("token");
    setUser(null);
    setIsPanelOpen(false);
    setShowLogoutModal(false);
    window.dispatchEvent(new Event("propbol:session-changed"));
    window.dispatchEvent(new Event("auth-state-changed"));
  };

  const isSessionExpired = () => {
    const expiresAt = localStorage.getItem(SESSION_EXPIRES_KEY);
    if (!expiresAt) return true;
    return Date.now() > Number(expiresAt);
  };

  const restoreSession = () => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    const expiresAt = localStorage.getItem(SESSION_EXPIRES_KEY);

    if (!savedUser || !expiresAt) {
      clearSession();
      return;
    }

    if (Date.now() > Number(expiresAt)) {
      clearSession();
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
    } catch {
      clearSession();
    }
  };

  useEffect(() => {
    restoreSession();

    const handleSessionChange = () => restoreSession();

    window.addEventListener("propbol:login", handleSessionChange);
    window.addEventListener("propbol:session-changed", handleSessionChange);

    return () => {
      window.removeEventListener("propbol:login", handleSessionChange);
      window.removeEventListener(
        "propbol:session-changed",
        handleSessionChange,
      );
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!panelRef.current) return;

      if (!panelRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (user && isSessionExpired()) {
        clearSession();
        router.push("/");
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user, router]);

  useEffect(() => {
    if (!open) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        toggleNotifications();
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open, toggleNotifications]);

  const togglePanel = () => {
    if (user && isSessionExpired()) {
      clearSession();
      router.push("/");
      return;
    }

    setIsPanelOpen((prev) => !prev);
  };

  const handleLoginRedirect = () => {
    router.push("/sign-in");
  };

  const handleLoginMock = () => {
    const mockUser: User = {
      name: "Juan Perez",
      email: "juan.perez@gmail.com",
    };

    const expiresAt = Date.now() + SESSION_DURATION_MS;

    setUser(mockUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
    localStorage.setItem(SESSION_EXPIRES_KEY, String(expiresAt));
    setIsLoggedIn(true);
    window.dispatchEvent(new Event("auth-state-changed"));
  };

  const handleOpenLogoutModal = () => {
    setShowLogoutModal(true);
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
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/auth/logout`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } catch {
        // si falla la red igual limpiamos la sesión local
      }
    }

    clearSession();
    setIsLoggingOut(false);
    router.push("/");
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-stone-200 bg-[#F9F6EE] shadow-sm">
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
                  aria-label="Abrir notificaciones"
                  aria-haspopup="true"
                  aria-expanded={open}
                  className="relative rounded-full p-2 transition duration-200 hover:bg-black/5 hover:shadow-sm"
                >
                  <Bell className="h-6 w-6 text-stone-600" />

                  {unreadCount > 0 ? (
                    <span
                      aria-label={`${unreadCount} notificaciones no leídas`}
                      className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-600 px-1 text-xs font-semibold text-white"
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : null}
                </button>

                {open ? (
                  <div
                    role="dialog"
                    aria-label="Panel de notificaciones"
                    aria-modal="true"
                    className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                      <h3
                        id="notifications-title"
                        className="text-sm font-semibold text-stone-900"
                      >
                        Notificaciones
                      </h3>

                      {isLoggedIn ? (
                        <button
                          type="button"
                          onClick={() => void markAllAsRead()}
                          disabled={!isOnline}
                          className="inline-flex items-center gap-1 text-xs text-amber-600 transition hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <CheckCheck className="h-4 w-4" />
                          Marcar todas
                        </button>
                      ) : null}
                    </div>

                    {!isOnline ? (
                      <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50 px-4 py-2 text-xs text-stone-500">
                        <WifiOff className="h-3 w-3 shrink-0" />
                        <span>Sin conexión. Se actualizará al reconectarte.</span>
                      </div>
                    ) : null}

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
                                  : "No leídas"}
                            </button>
                          ))}
                        </div>

                        <div
                          role="list"
                          aria-label="Lista de notificaciones"
                          aria-live="polite"
                          className="max-h-80 overflow-y-auto"
                          onScroll={(e) => {
                            const target = e.currentTarget;
                            const reachedBottom =
                              target.scrollTop + target.clientHeight >=
                              target.scrollHeight - 10;

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
                                  aria-label={`Notificación: ${notification.title}`}
                                  className={`border-b border-stone-100 px-4 py-3 transition hover:bg-stone-50 ${
                                    notification.status === "no leida"
                                      ? "bg-amber-50"
                                      : "bg-white"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold text-stone-900">
                                        {notification.title?.trim() ||
                                          "(Sin título)"}
                                      </p>

                                      <p className="mt-1 text-sm text-stone-600">
                                        {notification.description?.trim() ||
                                          "(Sin descripción disponible)"}
                                      </p>

                                      <span className="mt-2 inline-block text-[10px] uppercase text-stone-400">
                                        {notification.status}
                                      </span>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                      {notification.status === "no leida" ? (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            void markAsRead(notification.id)
                                          }
                                          disabled={!isOnline}
                                          aria-label={`Marcar como leída: ${notification.title}`}
                                          className="text-xs text-amber-600 transition hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                          Leer
                                        </button>
                                      ) : null}

                                      <button
                                        type="button"
                                        onClick={() =>
                                          void deleteNotification(
                                            notification.id,
                                          )
                                        }
                                        disabled={!isOnline}
                                        aria-label={`Eliminar notificación: ${notification.title}`}
                                        className="text-xs text-red-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {isLoadingMore ? (
                                <p className="px-4 py-3 text-center text-xs text-stone-400">
                                  Cargando más notificaciones...
                                </p>
                              ) : null}
                            </>
                          )}
                        </div>

                        <div className="border-t border-stone-100 px-4 py-3 text-center">
                          <Link
                            href="/notificaciones"
                            className="text-sm font-medium text-amber-600 transition hover:text-amber-700"
                          >
                            Ver todas las notificaciones
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
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
  );
}