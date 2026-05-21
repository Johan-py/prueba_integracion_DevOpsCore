"use client";

import { useEffect, useRef, useState } from "react";

type GoogleRegisterSuccessPayload = {
  type: "propbol:google-login-success";
  message: string;
  token: string;
  user: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
  };
};

type GoogleRegisterErrorPayload = {
  type: "propbol:google-login-error";
  code: string;
  message: string;
};

type GooglePopupMessage =
  | GoogleRegisterSuccessPayload
  | GoogleRegisterErrorPayload;

type GoogleRegisterButtonProps = {
  onSuccess: (payload: GoogleRegisterSuccessPayload) => void | Promise<void>;
  onError?: (message: string) => void;
  disabled?: boolean;
};

const GOOGLE_LOGIN_TIMEOUT_MS = 2 * 60 * 1000;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function GoogleLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.194 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.28 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.28 4 24 4c-7.682 0-14.344 4.337-17.694 10.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.161 0 9.86-1.977 13.409-5.196l-6.19-5.238C29.145 35.091 26.715 36 24 36c-5.173 0-9.62-3.326-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.566l.003-.002 6.19 5.238C36.973 39.2 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export default function GoogleRegisterButton({
  onSuccess,
  onError,
  disabled = false,
}: GoogleRegisterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const cleanup = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    window.removeEventListener("message", handleMessage);
    setIsLoading(false);
  };

  const handleMessage = async (event: MessageEvent<GooglePopupMessage>) => {
    const expectedOrigin = new URL(API_URL).origin;

    if (event.origin !== expectedOrigin) {
      return;
    }

    const data = event.data;

    if (!data || typeof data !== "object" || !("type" in data)) {
      return;
    }

    cleanup();

    if (data.type === "propbol:google-login-error") {
      onError?.(data.message || "No se pudo completar el registro con Google.");
      return;
    }

    await onSuccess(data);
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const handleGoogleRegister = () => {
    if (disabled || isLoading) {
      return;
    }

    onError?.("");
    setIsLoading(true);

    const popupWidth = 500;
    const popupHeight = 650;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    const popup = window.open(
      `${API_URL}/api/auth/google/register`,
      "google-register",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
    );

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      setIsLoading(false);
      onError?.(
        "El navegador bloqueó la ventana emergente. Habilita los pop-ups e intenta nuevamente.",
      );
      return;
    }

    popupRef.current = popup;
    popup.focus();

    window.addEventListener("message", handleMessage);

    intervalRef.current = window.setInterval(() => {
      if (!popupRef.current || !popupRef.current.closed) {
        return;
      }

      cleanup();
      onError?.("Cancelaste el registro con Google. Intenta nuevamente.");
    }, 500);

    timeoutRef.current = window.setTimeout(() => {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }

      cleanup();
      onError?.(
        "La autenticación con Google tardó demasiado. Intenta nuevamente.",
      );
    }, GOOGLE_LOGIN_TIMEOUT_MS);
  };

  return (
    <button
      type="button"
      onClick={handleGoogleRegister}
      disabled={disabled || isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-md border border-[#d6d3d1] bg-white px-4 py-2.5 text-[13px] font-medium text-[#292524] transition hover:bg-[#fafaf9] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleLogo />
      {isLoading ? "Conectando con Google..." : "Registrar con Google"}
    </button>
  );
}
