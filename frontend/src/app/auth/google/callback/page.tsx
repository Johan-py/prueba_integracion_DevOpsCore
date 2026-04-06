"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildGoogleSignupPrefillFromSearchParams,
  saveGoogleSignupPrefill,
} from "@/lib/auth/google";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState(
    "Procesando datos de tu cuenta de Google...",
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get("error");
    const isCancelled = error === "access_denied";
    let timeoutId: number | undefined;

    if (isCancelled) {
      setMessage(
        "Cancelaste la autenticación con Google. Redirigiendo al login...",
      );
      timeoutId = window.setTimeout(() => {
        router.replace("/sign-in");
      }, 1500);

      return () => {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
      };
    }

    if (error) {
      setMessage(
        "No se pudo iniciar sesión con Google. Redirigiendo al login...",
      );
      timeoutId = window.setTimeout(() => {
        router.replace("/sign-in");
      }, 1500);

      return () => {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
      };
    }

    const prefill = buildGoogleSignupPrefillFromSearchParams(searchParams);

    if (prefill) {
      saveGoogleSignupPrefill(prefill);
      setMessage(
        "Datos obtenidos correctamente. Redirigiendo al formulario...",
      );
    } else {
      setMessage(
        "No se recibieron datos para autocompletar el formulario. Redirigiendo...",
      );
    }

    timeoutId = window.setTimeout(() => {
      router.replace("/sign-up");
    }, 1000);

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f4] px-4">
      <div className="w-full max-w-md rounded-md border border-[#e7e5e4] bg-white px-6 py-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-[#292524]">
          Autenticación con Google
        </h1>
        <p className="mt-3 text-sm text-[#57534e]">{message}</p>
      </div>
    </main>
  );
}
