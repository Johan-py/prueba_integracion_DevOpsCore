// SecurityModal.tsx (añadir prop isLoading)
"use client";

import React, { useState } from "react";
import { Lock } from "lucide-react";

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  isLoading?: boolean;
}

export default function SecurityModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: SecurityModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Por favor, ingresa tu contraseña para continuar.");
      return;
    }
    setError("");
    onSubmit(password);
    setPassword("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm mx-4 border-t-4 border-amber-600">
        <h2 className="text-xl font-bold mb-2 text-stone-900">
          Seguridad Requerida
        </h2>

        <p className="text-sm text-stone-600 mb-4">
          Para editar tu correo electrónico, necesitamos verificar tu identidad.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-stone-600" />
            </div>

            <input
              type="password"
              className="w-full border border-stone-300 p-2 pl-10 rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
              placeholder="Ingresa tu contraseña actual"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

          <div className="flex justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-900 bg-stone-100 rounded hover:bg-stone-200 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors font-medium disabled:bg-amber-400"
              disabled={isLoading}
            >
              {isLoading ? "Verificando..." : "Verificar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
