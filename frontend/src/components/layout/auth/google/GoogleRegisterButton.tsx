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

function GoogleLogo() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.659 32.657 29.249 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.851 1.154 7.971 3.029l5.657-5.657C34.053 6.053 29.277 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.851 1.154 7.971 3.029l5.657-5.657C34.053 6.053 29.277 4 24 4c-7.682 0-14.347 4.337-17.694 10.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.176 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.141 35.091 26.715 36 24 36c-5.228 0-9.63-3.329-11.297-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.084 5.57l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        return;
      }

      const frontendOrigin = window.location.origin;
      const backendOrigin = new URL(apiUrl).origin;

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
        <GoogleLogo />
        <span>Iniciar sesión con Google</span>
      </button>

      {localError ? (
        <p className="text-[11px] text-red-500">{localError}</p>
      ) : null}
    </div>
  );
}
