"use client";

import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RegisterSuccessToast from "@/components/layout/RegisterSuccessToast";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import { useAccountStatus } from "@/hooks/useAccountStatus";
import { buildSessionUser, USER_STORAGE_KEY } from "@/lib/session";

const AUTH_ROUTES = ["/sign-in", "/sign-up", "/sign-in/verify-2fa"];
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const SESSION_EXPIRES_KEY = "propbol_session_expires";
const TOKEN_STORAGE_KEY = "token";
const AUTH_SYNC_EVENT_KEY = "propbol_auth_sync";
const SESSION_DURATION_MS = 60 * 60 * 1000;

function SessionManager() {
  const [showWarning, setShowWarning] = useState(false);

  const handleWarning = useCallback(() => {
    setShowWarning(true);
  }, []);

  const handleLogout = useCallback(() => {
    setShowWarning(false);
  }, []);

  const { resetInactivityTimer } = useInactivityLogout({
    onWarning: handleWarning,
    onLogout: handleLogout,
  });

  useAccountStatus();

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-orange-200 bg-white p-4 shadow-lg">
      <p className="text-sm font-medium text-gray-800">
        Tu sesión cerrará en 1 minuto por inactividad.
      </p>
      <button
        onClick={() => {
          setShowWarning(false);
          resetInactivityTimer();
        }}
        className="mt-2 text-xs font-semibold text-orange-500 hover:underline"
      >
        Seguir conectado
      </button>
    </div>
  );
}

const clearSession = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(SESSION_EXPIRES_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem("nombre");
  localStorage.removeItem("correo");
  localStorage.removeItem("avatar");
  localStorage.removeItem("controlador");
  localStorage.removeItem("searchHistory");
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AUTH_SYNC_EVENT_KEY && event.newValue) {
        try {
          const payload = JSON.parse(event.newValue) as { type?: string };

          if (payload.type === "logout") {
            clearSession();
            window.dispatchEvent(new Event("propbol:session-changed"));
            window.dispatchEvent(new Event("auth-state-changed"));
            return;
          }
        } catch {
          return;
        }
      }

      if (event.key === TOKEN_STORAGE_KEY && event.newValue === null) {
        clearSession();
        window.dispatchEvent(new Event("propbol:session-changed"));
        window.dispatchEvent(new Event("auth-state-changed"));
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!token) {
        clearSession();
        window.dispatchEvent(new Event("propbol:session-changed"));
        window.dispatchEvent(new Event("auth-state-changed"));
        return;
      }

      if (!navigator.onLine) return;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          headers: { authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 403 || response.status === 401) {
          clearSession();
          window.dispatchEvent(new Event("propbol:session-changed"));
          window.dispatchEvent(new Event("auth-state-changed"));
          return;
        }

        if (!response.ok) return;

        const data = await response.json();

        localStorage.setItem(
          SESSION_EXPIRES_KEY,
          String(Date.now() + SESSION_DURATION_MS),
        );

        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(buildSessionUser(data.user)),
        );

        window.dispatchEvent(new Event("propbol:session-changed"));
        window.dispatchEvent(new Event("auth-state-changed"));
      } catch {
        // Timeout o error de red — NO limpiar sesión
      }
    };

    validateSession();
  }, [pathname]);

  if (isAuthRoute) return <>{children}</>;

  return (
    <>
      <SessionManager />
      <RegisterSuccessToast />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
