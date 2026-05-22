"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const INACTIVITY_LIMIT_MS = 3 * 60 * 1000;
const WARNING_BEFORE_MS = 1 * 60 * 1000;

const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "propbol_user";
const SESSION_EXPIRES_KEY = "propbol_session_expires";

const ACTIVITY_EVENTS = [
  "mousemove",
  "keydown",
  "mousedown",
  "touchstart",
  "scroll",
] as const;

type UseInactivityLogoutOptions = {
  onWarning?: () => void;
  onLogout?: () => void;
};

export function useInactivityLogout({
  onWarning,
  onLogout,
}: UseInactivityLogoutOptions = {}) {
  const router = useRouter();
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
      logoutTimer.current = null;
    }

    if (warningTimer.current) {
      clearTimeout(warningTimer.current);
      warningTimer.current = null;
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(SESSION_EXPIRES_KEY);
    window.dispatchEvent(new Event("propbol:session-changed"));
  }, []);

  const logout = useCallback(() => {
    clearTimers();
    clearSession();
    sessionStorage.setItem(
      "authMessage",
      "Tu sesión expiró por inactividad. Inicia sesión nuevamente.",
    );
    onLogout?.();
    router.replace("/sign-in?reason=inactivity");
  }, [clearSession, clearTimers, onLogout, router]);

  const resetInactivityTimer = useCallback(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token) {
      clearTimers();
      return;
    }

    clearTimers();

    localStorage.setItem(
      SESSION_EXPIRES_KEY,
      String(Date.now() + INACTIVITY_LIMIT_MS),
    );

    warningTimer.current = setTimeout(() => {
      onWarning?.();
    }, INACTIVITY_LIMIT_MS - WARNING_BEFORE_MS);

    logoutTimer.current = setTimeout(() => {
      logout();
    }, INACTIVITY_LIMIT_MS);
  }, [clearTimers, logout, onWarning]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token) return;

    resetInactivityTimer();

    const handleActivity = () => {
      resetInactivityTimer();
    };

    const handleStorageSync = () => {
      const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!currentToken) {
        clearTimers();
        onLogout?.();
        return;
      }

      resetInactivityTimer();
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    window.addEventListener("propbol:login", handleActivity);
    window.addEventListener("propbol:session-changed", handleStorageSync);

    return () => {
      clearTimers();

      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      window.removeEventListener("propbol:login", handleActivity);
      window.removeEventListener("propbol:session-changed", handleStorageSync);
    };
  }, [clearTimers, onLogout, resetInactivityTimer]);

  return {
    resetInactivityTimer,
    logout,
  };
}
