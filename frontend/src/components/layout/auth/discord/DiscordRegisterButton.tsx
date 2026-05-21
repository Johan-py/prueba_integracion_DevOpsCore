"use client";

import { useEffect, useRef, useState } from "react";

type DiscordRegisterSuccessPayload = {
  type: "propbol:discord-login-success";
  message: string;
  token: string;
  user: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
    avatar?: string | null;
  };
};

type DiscordRegisterErrorPayload = {
  type: "propbol:discord-login-error";
  code: string;
  message: string;
};

type DiscordPopupMessage =
  | DiscordRegisterSuccessPayload
  | DiscordRegisterErrorPayload;

type DiscordRegisterButtonProps = {
  onSuccess: (payload: DiscordRegisterSuccessPayload) => void | Promise<void>;
  onError?: (message: string) => void;
  disabled?: boolean;
};

const DISCORD_LOGIN_TIMEOUT_MS = 2 * 60 * 1000;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function DiscordLogo() {
  return (
    <span className="flex h-5 w-5 items-center justify-center text-white">
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.317 4.369A19.791 19.791 0 0 0 15.893 3c-.191.337-.413.793-.566 1.153a18.27 18.27 0 0 0-5.654 0A12.91 12.91 0 0 0 9.107 3a19.736 19.736 0 0 0-4.429 1.372C1.878 8.515 1.12 12.55 1.5 16.528A19.9 19.9 0 0 0 6.93 19.27a14.6 14.6 0 0 0 1.164-1.887 12.93 12.93 0 0 1-1.833-.88c.154-.112.304-.229.45-.348a14.18 14.18 0 0 0 10.578 0c.147.12.297.236.45.348-.583.346-1.198.642-1.837.882.336.66.724 1.292 1.164 1.886a19.85 19.85 0 0 0 5.434-2.742c.447-4.611-.763-8.61-2.183-12.16ZM8.68 14.086c-1.06 0-1.93-.976-1.93-2.176 0-1.2.85-2.176 1.93-2.176 1.09 0 1.95.986 1.93 2.176 0 1.2-.85 2.176-1.93 2.176Zm6.64 0c-1.06 0-1.93-.976-1.93-2.176 0-1.2.85-2.176 1.93-2.176 1.09 0 1.95.986 1.93 2.176 0 1.2-.84 2.176-1.93 2.176Z" />
      </svg>
    </span>
  );
}

export default function DiscordRegisterButton({
  onSuccess,
  onError,
  disabled = false,
}: DiscordRegisterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleMessage = async (event: MessageEvent<DiscordPopupMessage>) => {
    const expectedOrigin = new URL(API_URL).origin;

    if (event.origin !== expectedOrigin) return;

    const data = event.data;

    if (!data || typeof data !== "object" || !("type" in data)) return;

    cleanup();

    if (data.type === "propbol:discord-login-error") {
      onError?.(
        data.message || "No se pudo completar el registro con Discord.",
      );
      return;
    }

    await onSuccess(data);
  };

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

  useEffect(() => {
    return () => cleanup();
  }, []);

  const handleDiscordRegister = () => {
    if (disabled || isLoading) return;

    onError?.("");
    setIsLoading(true);

    const popupWidth = 500;
    const popupHeight = 650;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    const popup = window.open(
      `${API_URL}/api/auth/discord/register`,
      "discord-register",
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
      if (!popupRef.current || !popupRef.current.closed) return;

      cleanup();
      onError?.("Cancelaste el registro con Discord. Intenta nuevamente.");
    }, 500);

    timeoutRef.current = window.setTimeout(() => {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }

      cleanup();
      onError?.(
        "La autenticación con Discord tardó demasiado. Intenta nuevamente.",
      );
    }, DISCORD_LOGIN_TIMEOUT_MS);
  };

  return (
    <button
      type="button"
      onClick={handleDiscordRegister}
      disabled={disabled || isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] px-4 py-3 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#4752C4] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <DiscordLogo />
      {isLoading ? "Conectando con Discord..." : "Registrarse con Discord"}
    </button>
  );
}
