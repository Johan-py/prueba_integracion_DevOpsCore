"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type GoogleAuthSuccessPayload = {
  type: "propbol:google-login-success";
  message: string;
  token: string;
  user: {
    id: number;
    correo: string;
    nombre: string;
    apellido: string;
  };
};

type GoogleAuthErrorPayload = {
  type: "propbol:google-login-error";
  code: string;
  message: string;
};

type GoogleAuthMessage = GoogleAuthSuccessPayload | GoogleAuthErrorPayload;

type GoogleRegisterButtonProps = {
  onSuccess?: (payload: GoogleAuthSuccessPayload) => void | Promise<void>;
  onError?: (message: string) => void;
  disabled?: boolean;
};

const POPUP_WIDTH = 520;
const POPUP_HEIGHT = 720;
const AUTH_TIMEOUT_MS = 60000;

export default function GoogleRegisterButton({
  onSuccess,
  onError,
  disabled = false,
}: GoogleRegisterButtonProps) {
  const [localError, setLocalError] = useState("");
  const popupRef = useRef<Window | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const setErrorMessage = useCallback(
    (message: string) => {
      setLocalError(message);
      onError?.(message);
    },
    [onError],
  );

  const clearErrorMessage = useCallback(() => {
    setLocalError("");
    onError?.("");
  }, [onError]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent<GoogleAuthMessage>) => {
      const frontendOrigin = window.location.origin;
      const backendOrigin = new URL(process.env.NEXT_PUBLIC_API_URL || "")
        .origin;

      if (event.origin !== frontendOrigin && event.origin !== backendOrigin) {
        return;
      }

      const data = event.data;

      if (!data || typeof data !== "object" || !("type" in data)) {
        return;
      }

      if (data.type === "propbol:google-login-error") {
        clearTimers();
        popupRef.current = null;
        setErrorMessage(data.message);
        return;
      }

      if (data.type === "propbol:google-login-success") {
        clearTimers();
        popupRef.current = null;
        clearErrorMessage();
        await onSuccess?.(data);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimers();
    };
  }, [clearErrorMessage, clearTimers, onSuccess, setErrorMessage]);

  const handleGoogleRegister = () => {
    if (disabled) return;

    clearErrorMessage();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setErrorMessage("Falta configurar NEXT_PUBLIC_API_URL");
      return;
    }

    const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2;
    const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2;

    const popup = window.open(
      `${apiUrl}/api/auth/google/login?intent=signup`,
      "propbol-google-signup",
      `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},popup=yes`,
    );

    if (!popup) {
      setErrorMessage(
        "No se pudo abrir la ventana de Google. Verifica si el navegador bloqueó el popup.",
      );
      return;
    }

    popupRef.current = popup;

    timeoutRef.current = window.setTimeout(() => {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }

      popupRef.current = null;
      setErrorMessage(
        "Se agotó el tiempo para completar la autenticación con Google.",
      );
    }, AUTH_TIMEOUT_MS);

    intervalRef.current = window.setInterval(() => {
      if (popupRef.current?.closed) {
        clearTimers();
        popupRef.current = null;
      }
    }, 500);
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleGoogleRegister}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-3 rounded-md border border-[#d6d3d1] bg-white px-4 py-3 text-sm font-medium text-[#44403c] transition hover:bg-[#fafaf9] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="text-lg">G</span>
        <span>Iniciar sesión con Google</span>
      </button>

      {localError ? (
        <p className="text-[11px] text-red-500">{localError}</p>
      ) : null}
    </div>
  );
}
