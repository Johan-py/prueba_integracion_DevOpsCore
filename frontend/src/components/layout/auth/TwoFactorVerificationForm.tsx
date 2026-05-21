"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { buildSessionUser, USER_STORAGE_KEY } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const PENDING_2FA_KEY = "pending2FA";
const REDIRECT_AFTER_LOGIN_KEY = "redirectAfterLogin";
const DEFAULT_POST_LOGIN_REDIRECT = "/";
const RESEND_COOLDOWN_SECONDS = 60;

type Verify2FAResponse = {
  message?: string;
  token?: string;
  user?: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
    avatar?: string | null;
  };
};

type Pending2FAData = {
  userId: number;
  email?: string;
  expiresInMinutes?: number;
  createdAt?: number;
};

const saveSession = (
  token: string,
  user?: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
    avatar?: string | null;
  },
) => {
  localStorage.setItem("token", token);

  const sessionUser = buildSessionUser(user);

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));
  localStorage.setItem("controlador", "false");

  localStorage.setItem("nombre", sessionUser.name);
  localStorage.setItem("correo", sessionUser.email);
  localStorage.setItem("avatar", sessionUser.avatar ?? "");
  localStorage.setItem(
    "propbol_session_expires",
    String(Date.now() + 60 * 60 * 1000),
  );

  window.dispatchEvent(new Event("propbol:login"));
  window.dispatchEvent(new Event("propbol:session-changed"));
  window.dispatchEvent(new Event("auth-state-changed"));
  window.dispatchEvent(new Event("propbol:token-guardado"));
};

const getRedirectAfterLogin = () => {
  const redirect = localStorage.getItem(REDIRECT_AFTER_LOGIN_KEY);

  if (!redirect || !redirect.startsWith("/")) {
    return DEFAULT_POST_LOGIN_REDIRECT;
  }

  return redirect;
};

const clearRedirectAfterLogin = () => {
  localStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
};

const getPending2FA = (): Pending2FAData | null => {
  const raw = localStorage.getItem(PENDING_2FA_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as Pending2FAData;
  } catch {
    return null;
  }
};

const clearPending2FA = () => {
  localStorage.removeItem(PENDING_2FA_KEY);
};
const maskEmail = (email: string): string => {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  const masked = "*".repeat(Math.max(local.length - 2, 3));
  return `${visible}${masked}@${domain}`;
};

export default function TwoFactorVerificationForm() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pending2FA, setPending2FA] = useState<Pending2FAData | null>(null);

  const cooldownIntervalRef = useRef<number | null>(null);

  const clearCooldownInterval = () => {
    if (cooldownIntervalRef.current !== null) {
      window.clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }
  };

  const startCooldown = (seconds: number) => {
    clearCooldownInterval();
    setResendCooldown(seconds);

    cooldownIntervalRef.current = window.setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearCooldownInterval();
          sessionStorage.removeItem("resend2FA_sentAt");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    setPending2FA(getPending2FA());
  }, []);

  useEffect(() => {
    const savedAt = sessionStorage.getItem("resend2FA_sentAt");
    if (!savedAt) return;

    const elapsed = Math.floor((Date.now() - Number(savedAt)) / 1000);
    const remaining = RESEND_COOLDOWN_SECONDS - elapsed;

    if (remaining <= 0) {
      sessionStorage.removeItem("resend2FA_sentAt");
      return;
    }

    startCooldown(remaining);

    return () => {
      clearCooldownInterval();
    };
  }, []);

  const handleCodeChange = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, "").slice(0, 6);
    setCode(onlyNumbers);
    setError("");
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pasted = e.clipboardData.getData("text");
    const cleaned = pasted.trim().replace(/\D/g, "").slice(0, 6);

    setCode(cleaned);
    setError("");
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError("Ingresa un código válido de 6 dígitos");
      return;
    }

    if (!pending2FA?.userId) {
      setError(
        "No se encontró una verificación pendiente. Inicia sesión nuevamente.",
      );
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: pending2FA.userId,
          codigo: code,
        }),
      });

      const data = (await response.json()) as Verify2FAResponse;

      if (!response.ok) {
        setError(data.message || "No se pudo verificar el código");
        return;
      }

      if (!data.token) {
        setError("El servidor no devolvió un token válido");
        return;
      }

      saveSession(data.token, data.user);
      clearPending2FA();
      setSuccessMessage(data.message || "Verificación 2FA exitosa");

      const redirect = getRedirectAfterLogin();
      clearRedirectAfterLogin();

      window.setTimeout(() => {
        router.push(redirect);
      }, 800);
    } catch {
      setError("No se pudo conectar con el servidor. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    clearPending2FA();
    router.push("/sign-in");
  };

  const handleResendCode = async () => {
    if (!pending2FA?.userId || resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pending2FA.userId }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message || "No se pudo reenviar el código");
        return;
      }

      setSuccessMessage("Código reenviado. Revisa tu correo.");
      setCode("");

      sessionStorage.setItem("resend2FA_sentAt", String(Date.now()));
      startCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setError("No se pudo conectar con el servidor. Intenta nuevamente.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md">
      <h1 className="text-2xl font-bold text-gray-900">
        Verificación en dos pasos
      </h1>

      <p className="mt-2 text-sm text-gray-600">
        Ingresa el código de 6 dígitos enviado a tu correo electrónico.
      </p>

      {pending2FA?.email && (
        <p className="mt-2 text-sm text-gray-500">
          Código enviado a:{" "}
          <span className="font-medium">{maskEmail(pending2FA.email)}</span>
        </p>
      )}

      <div className="mt-6">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Código de verificación
        </label>

        <input
          type="text"
          inputMode="numeric"
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          onPaste={handleCodePaste}
          onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()} 
          placeholder="123456"
          className={`w-full rounded-md border px-3 py-2 text-sm outline-none ${
            error
              ? "border-red-400 focus:border-red-500"
              : "border-gray-300 focus:border-orange-500"
          }`}
        />

        {error && (
          <div className="mt-1">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        {successMessage && (
          <p className="mt-1 text-xs text-green-600">{successMessage}</p>
        )}

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendCooldown > 0 || isResending || !pending2FA?.userId}
            className="text-sm text-orange-500 underline-offset-2 transition-colors hover:text-orange-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
          >
            {isResending
              ? "Reenviando..."
              : resendCooldown > 0
                ? `Reenviar código (${resendCooldown}s)`
                : "Reenviar código"}
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={handleBackToLogin}
          className="flex-1 rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver al login
        </button>

        <button
          type="button"
          onClick={handleVerifyCode}
          disabled={code.length !== 6 || isLoading}
          className="flex-1 rounded-md bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
        >
          {isLoading ? "Verificando..." : "Verificar código"}
        </button>
      </div>
    </div>
  );
}
