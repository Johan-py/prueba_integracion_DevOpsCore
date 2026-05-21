"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-md bg-white p-8 shadow-md text-center">
          <p className="text-red-500 font-medium">Enlace inválido o expirado.</p>
          <button
            onClick={() => router.push("/forgot-password")}
            className="mt-4 w-full rounded-md bg-orange-400 py-2 text-sm font-semibold text-white hover:bg-orange-500"
          >
            Solicitar nuevo enlace
          </button>
        </div>
      </main>
    );
  }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  if (!token) {
    setError("Token inválido o faltante");
    return;
  }

  if (!password || !confirmPassword) {
    setError("Todos los campos son obligatorios");
    return;
  }

  const errorContrasena = obtenerErrorContrasena(password);
  if (errorContrasena) {
    setError(errorContrasena);
    return;
  }

  if (password !== confirmPassword) {
    setError("Las contraseñas no coinciden");
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
        confirmPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "No se pudo restablecer la contraseña");
    }

    setSuccess("Contraseña restablecida correctamente");
    setTimeout(() => {
      router.push("/sign-in");
    }, 2000);
  } catch (error) {
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError("Ocurrió un error inesperado");
    }
  } finally {
    setIsLoading(false);
  }
};

  const obtenerErrorContrasena = (value: string) => {
      if (!value) return "";

      const errores: string[] = [];

      if (value.length < 8) errores.push("mínimo 8 caracteres");
      if (!/[A-Z]/.test(value)) errores.push("una mayúscula");
      if (!/[0-9]/.test(value)) errores.push("un número");
      if (!/[^A-Za-z0-9]/.test(value)) errores.push("un carácter especial");

     if (errores.length > 0) {
      return `La contraseña debe cumplir con: ${errores.join(", ")}`;
      }
      return "";
     }; 
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-md bg-white p-8 shadow-md">
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          Reestablece tu contraseña
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <div
              className="relative"
              ref={passwordRef}
              onBlur={(e) => {
                if (!passwordRef.current?.contains(e.relatedTarget as Node)) {
                  setShowPassword(false);
                }
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                    if (!value) {
                     setError("");
                     return;
                     }

                      const errorContrasena = obtenerErrorContrasena(value);

                       if (errorContrasena) {
                        setError(errorContrasena);
                        return;
                      }

                      if (confirmPassword && value !== confirmPassword) {
                       setError("Las contraseñas no coinciden");
                       return;
                       }
                       setError("");
                          }}
                placeholder="Ingresa tu nueva contraseña"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Confirma tu nueva contraseña
            </label>
            <div
              className="relative"
              ref={confirmRef}
              onBlur={(e) => {
                if (!confirmRef.current?.contains(e.relatedTarget as Node)) {
                  setShowConfirm(false);
                }
              }}
            >
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                 const value = e.target.value;
                 setConfirmPassword(value);
                  if (!password) {
                     setError("");
                    return;
                     }

                     const errorContrasena = obtenerErrorContrasena(password);

                    if (errorContrasena) {
                      setError(errorContrasena);
                     return;
                    }

                     if (!value) {
                     setError("");
                     return;
                   }

                    if (password !== value) {
                      setError("Las contraseñas no coinciden");
                    return;
                    }

                     setError("");
                      }}
                placeholder="Ingresa tu contraseña nuevamente"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
              {success} Redirigiendo...
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !!success}
            className={`w-full rounded-md py-2 text-sm font-semibold text-white ${
              isLoading || success
                ? "cursor-not-allowed bg-orange-300"
                : "bg-orange-400 hover:bg-orange-500"
            }`}
          >
            {isLoading ? "Guardando..." : "Cambiar mi contraseña"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/sign-in")}
            className="w-full rounded-md bg-gray-700 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Volver al inicio de sesión
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
