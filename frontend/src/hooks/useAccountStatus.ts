"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const TOKEN_KEY = "token";
const AUTH_MESSAGE_KEY = "authMessage";
const POLL_INTERVAL_MS = 15 * 1000;

const SESSION_EXPIRED_MESSAGE = "Tu sesión expiró. Inicia sesión nuevamente.";

const clearClientSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("propbol_user");
  localStorage.removeItem("propbol_session_expires");
  localStorage.removeItem("nombre");
  localStorage.removeItem("correo");
  localStorage.removeItem("avatar");

  window.dispatchEvent(new Event("propbol:session-changed"));
  window.dispatchEvent(new Event("auth-state-changed"));
};

export function useAccountStatus() {
  const router = useRouter();
  const intervalRef = useRef<number | null>(null);

  const redirectToLoginWithMessage = useCallback(() => {
    clearClientSession();
    sessionStorage.setItem(AUTH_MESSAGE_KEY, SESSION_EXPIRED_MESSAGE);
    router.replace("/sign-in");
  }, [router]);

  const checkAccountStatus = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        redirectToLoginWithMessage();
        return;
      }

      if (response.status === 403) {
        clearClientSession();
        router.replace("/sign-in");
      }
    } catch {}
  }, [redirectToLoginWithMessage, router]);

  useEffect(() => {
    void checkAccountStatus();

    intervalRef.current = window.setInterval(() => {
      void checkAccountStatus();
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [checkAccountStatus]);
}
