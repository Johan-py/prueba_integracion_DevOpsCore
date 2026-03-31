"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RegisterSuccessToast from "@/components/layout/RegisterSuccessToast";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";

const AUTH_ROUTES = ["/sign-in", "/sign-up"];
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const USER_STORAGE_KEY = "propbol_user";
const SESSION_EXPIRES_KEY = "propbol_session_expires";
const TOKEN_STORAGE_KEY = "token";

function SessionManager() {
  const [showWarning, setShowWarning] = useState(false);

  const handleWarning = useCallback(() => setShowWarning(true), []);
  const handleLogout = useCallback(() => setShowWarning(false), []);

  useInactivityLogout({
    onWarning: handleWarning,
    onLogout: handleLogout,
  });

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-orange-200 bg-white p-4 shadow-lg">
      <p className="text-sm font-medium text-gray-800">
        Tu sesión cerrará en 1 minuto por inactividad.
      </p>
      <button
        onClick={() => setShowWarning(false)}
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
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const router = useRouter();

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const expiresAt = localStorage.getItem(SESSION_EXPIRES_KEY);

      if (!token || !expiresAt) {
        clearSession();
        window.dispatchEvent(new Event("propbol:session-changed"));
        return;
      }

      if (Date.now() > Number(expiresAt)) {
        clearSession();
        window.dispatchEvent(new Event("propbol:session-changed"));
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          clearSession();
          window.dispatchEvent(new Event("propbol:session-changed"));
          return;
        }

        const data = await response.json();

        const userName =
          data.user?.nombre && data.user?.apellido
            ? `${data.user.nombre} ${data.user.apellido}`
            : (data.user?.correo ?? "");

        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify({
            name: userName,
            email: data.user?.correo ?? "",
          }),
        );

        localStorage.setItem(
          SESSION_EXPIRES_KEY,
          String(Date.now() + 60 * 60 * 1000),
        );

        window.dispatchEvent(new Event("propbol:session-changed"));
      } catch {
        clearSession();
        window.dispatchEvent(new Event("propbol:session-changed"));
      }
    };

    validateSession();
  }, [pathname, router]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

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
