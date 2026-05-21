"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type ForgotPasswordResponse = {
  message: string;
};

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const correoNormalizado = correo.trim().toLowerCase();
    setError("");
    setSuccessMessage("");

    if (!correoNormalizado) {
      setError("El correo es obligatorio");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(correoNormalizado)) {
      setError("Formato de correo inválido");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: correoNormalizado,
        }),
      });

      const data = (await response.json()) as ForgotPasswordResponse;

      if (!response.ok) {
        setError(data.message || "No se pudo procesar la solicitud.");
        return;
      }

      setSuccessMessage(
        data.message ||
          "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña."
      );
      setCorreo("");
    } catch (err) {
      setError("No se pudo conectar con el servidor. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-md bg-white p-8 shadow-md">
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          ¿Olvidaste tu contraseña?
        </h1>

        <p className="mb-6 text-sm text-gray-600">
          Ingresa el correo electrónico de tu cuenta para que podamos enviarte
          un enlace para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>

            <input
              type="email"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                if (error) setError("");
                if (successMessage) setSuccessMessage("");
              }}
              placeholder="Ingresa tu correo electrónico"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          {successMessage && (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-md py-2 text-sm font-semibold text-white ${
              isLoading
                ? "cursor-not-allowed bg-orange-300"
                : "bg-orange-400 hover:bg-orange-500"
            }`}
          >
            {isLoading ? "Enviando..." : "Enviar correo electrónico"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/sign-in")}
            className="w-full rounded-md bg-gray-700 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Regresar
          </button>
        </form>
      </div>
    </main>
  );
}