"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildSessionUser, USER_STORAGE_KEY } from "@/lib/session";

type MagicLinkLoginResponse = {
  message?: string;
  token?: string;
  user?: {
    id: number;
    correo: string;
    nombre?: string;
    apellido?: string;
    avatar?: string | null;
    rol?: string | { nombre: string };
    controlador?: boolean | null;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const SESSION_DURATION_MS = 60 * 60 * 1000;

const getBrowserStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    window.localStorage.setItem("__test__", "1");
    window.localStorage.removeItem("__test__");
    return window.localStorage;
  } catch {
    return window.sessionStorage;
  }
};

const saveMagicLinkSession = (
  token: string,
  user: NonNullable<MagicLinkLoginResponse["user"]>,
) => {
  const storage = getBrowserStorage();

  if (!storage) {
    return;
  }

  storage.setItem("token", token);

  const sessionUser = buildSessionUser(user);

  storage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));
  storage.setItem("nombre", sessionUser.name);
  storage.setItem("correo", sessionUser.email);
  storage.setItem("avatar", sessionUser.avatar ?? "");
  storage.setItem("controlador", String(sessionUser.controlador ?? false));
  storage.setItem(
    "propbol_session_expires",
    String(Date.now() + SESSION_DURATION_MS),
  );

  window.dispatchEvent(new Event("propbol:login"));
  window.dispatchEvent(new Event("propbol:session-changed"));
  window.dispatchEvent(new Event("auth-state-changed"));
  window.dispatchEvent(new Event("propbol:token-guardado"));
};

function MagicLinkAccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const hasProcessedTokenRef = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const [message, setMessage] = useState(
    "Estamos verificando tu link mágico. Espera un momento, por favor.",
  );

  const [isExpiredLink, setIsExpiredLink] = useState(false);
  const [isInvalidLink, setIsInvalidLink] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("El enlace no contiene un token válido.");
      setIsExpiredLink(false);
      setIsInvalidLink(true);
      setIsNetworkError(false);
      return;
    }

    if (hasProcessedTokenRef.current && retryCount === 0) return;

    hasProcessedTokenRef.current = true;

    const loginWithMagicLink = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/magic-link/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = (await response.json()) as MagicLinkLoginResponse;

        if (!response.ok || !data.token || !data.user) {
          const errorMessage =
            data.message || "No se pudo validar tu acceso con Magic Link.";

          const normalizedError = errorMessage.toLowerCase();

          setStatus("error");
          setMessage(errorMessage);
          setIsExpiredLink(normalizedError.includes("expir"));
          setIsInvalidLink(
            normalizedError.includes("alterado") ||
              normalizedError.includes("no es válido") ||
              normalizedError.includes("inválido") ||
              normalizedError.includes("invalido") ||
              normalizedError.includes("no es reconocido"),
          );
          setIsNetworkError(false);

          return;
        }

        saveMagicLinkSession(data.token, data.user);

        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem("magicLinkEmail");
        }

        setStatus("success");
        setMessage(
          "Tu acceso fue validado correctamente. Serás redirigido a PropBol.",
        );
        setIsExpiredLink(false);
        setIsInvalidLink(false);
        setIsNetworkError(false);

        window.setTimeout(() => {
          router.replace("/");
        }, 1800);
      } catch {
        setStatus("error");
        setMessage(
          "Se perdió la conexión durante la validación. Verifica tu red e intenta nuevamente.",
        );
        setIsExpiredLink(false);
        setIsInvalidLink(false);
        setIsNetworkError(true);
      }
    };

    loginWithMagicLink();
  }, [router, token, retryCount]);

  useEffect(() => {
    if (!isNetworkError) return;

    const handleOnline = () => {
      hasProcessedTokenRef.current = false;
      setStatus("loading");
      setMessage(
        "Conexión recuperada. Estamos verificando tu link mágico nuevamente.",
      );
      setRetryCount((current) => current + 1);
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [isNetworkError]);

  const handleErrorAction = () => {
    if (isNetworkError) {
      hasProcessedTokenRef.current = false;
      setStatus("loading");
      setMessage("Reintentando validación del Magic Link...");
      setRetryCount((current) => current + 1);
      return;
    }

    router.replace("/sign-in");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <section className="w-full max-w-md rounded-sm border border-[#e7e5e4] bg-white px-8 py-10 text-center shadow-md">
        <h1 className="text-3xl font-extrabold text-[#111827]">
          Validando tu acceso
        </h1>

        <p className="mt-3 text-base font-medium leading-relaxed text-[#6b7280]">
          Estamos verificando tu link mágico.
          <br />
          Espera un momento, por favor.
        </p>

        <div className="mt-8 flex justify-center">
          {status === "loading" ? (
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
          ) : (
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${
                status === "success" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <span
                className={`text-3xl font-bold ${
                  status === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {status === "success" ? "✓" : "!"}
              </span>
            </div>
          )}
        </div>

        <div className="my-9 border-t border-[#e5e7eb]" />

        {status === "loading" && (
          <>
            <h2 className="text-xl font-extrabold text-orange-500">
              Validando enlace
            </h2>

            <p className="mt-3 text-sm font-semibold leading-relaxed text-[#9ca3af]">
              No cierres esta ventana.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-xl font-extrabold text-green-600">
              Inicio de sesión exitoso
            </h2>

            <p className="mt-3 text-sm font-semibold leading-relaxed text-[#9ca3af]">
              {message}
            </p>

            <p className="mt-8 text-sm font-semibold text-[#9ca3af]">
              <span className="text-orange-500">•</span> Redirigiendo...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-xl font-extrabold text-red-600">
              {isExpiredLink
                ? "Magic Link expirado"
                : isInvalidLink
                  ? "Magic Link inválido"
                  : isNetworkError
                    ? "Conexión interrumpida"
                    : "No se pudo iniciar sesión"}
            </h2>

            <p className="mt-3 text-sm font-semibold leading-relaxed text-[#9ca3af]">
              {message}
            </p>

            <button
              type="button"
              onClick={handleErrorAction}
              className="mt-8 w-full rounded-md bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              {isExpiredLink
                ? "Solicitar un nuevo Magic Link"
                : isNetworkError
                  ? "Reintentar validación"
                  : "Volver al inicio de sesión"}
            </button>
          </>
        )}
      </section>
    </main>
  );
}

export default function MagicLinkSentPage() {
  return (
    <Suspense fallback={null}>
      <MagicLinkAccessContent />
    </Suspense>
  );
}
