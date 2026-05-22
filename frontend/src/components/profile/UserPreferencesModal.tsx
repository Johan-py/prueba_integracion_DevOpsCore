'use client';
import React, { useState } from 'react';

interface UserPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserPreferencesModal({ isOpen, onClose, onSuccess }: UserPreferencesModalProps) {
  const [genero, setGenero] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    // Validación: ambos campos son requeridos
    if (!genero) {
      setErrorMsg('Por favor selecciona tu género');
      setIsLoading(false);
      return;
    }

    if (!fechaNacimiento) {
      setErrorMsg('Por favor ingresa tu fecha de nacimiento');
      setIsLoading(false);
      return;
    }

    // Validación de edad (> 18 años)
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      setErrorMsg('Debes ser mayor de 18 años para guardar tu perfil.');
      setIsLoading(false);
      return;
    }

    // Envío al endpoint correcto: /api/telemetria/aceptar
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setErrorMsg('No hay sesión activa. Por favor inicia sesión nuevamente.');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/telemetria/aceptar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          genero: genero,
          fecha_nacimiento: fechaNacimiento
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Disparar evento para actualizar otros componentes
        window.dispatchEvent(new Event('profileUpdated'));
        window.dispatchEvent(new Event('storage'));

        // Guardar en localStorage que ya vio/aceptó la telemetría
        localStorage.setItem('has_seen_telemetry', 'true');
        localStorage.setItem('telemetria_compartida', 'true');

        onSuccess();
      } else {
        setErrorMsg(data.message || 'Error al guardar los datos en el servidor.');
      }
    } catch (error) {
      console.error('Error de red:', error);
      setErrorMsg('No se pudo conectar con el servidor. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative border border-stone-100 animate-in zoom-in duration-300">

        <div className="p-8">
          <h2 className="text-2xl font-bold text-[#292524] mb-2 text-center">
            Completa tu perfil
          </h2>
          <p className="text-[#78716c] mb-6 text-sm text-center">
            Estos datos nos ayudan a personalizar tu experiencia en la plataforma.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ALERTA VISUAL DE ERRORES */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                <span className="font-bold mt-0.5">!</span>
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Campo Género */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-stone-700 block">
                Género <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={genero}
                onChange={(e) => {
                  setGenero(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full p-3 rounded-lg border-2 border-[#fcd34d] bg-[#fffbeb] text-stone-800 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
              >
                <option value="" disabled>Selecciona tu género</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
                <option value="OTRO">Otro</option>
                <option value="PREFIERO_NO_DECIR">Prefiero no decirlo</option>
              </select>
            </div>

            {/* Campo Fecha de Nacimiento */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-stone-700 block">
                Fecha de Nacimiento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                max={(() => {
                  const date = new Date();
                  date.setFullYear(date.getFullYear() - 18);
                  return date.toISOString().split('T')[0];
                })()}
                value={fechaNacimiento}
                onChange={(e) => {
                  setFechaNacimiento(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full p-3 rounded-lg border-2 border-[#fcd34d] bg-[#fffbeb] text-stone-800 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors"
              />
              <p className="text-[11px] text-stone-500 mt-1 italic">
                * Debes ser mayor de 18 años para continuar.
              </p>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 font-semibold mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-stone-300 text-stone-500 rounded-md hover:bg-[#f5f5f4] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-[#D97706] text-white rounded-md hover:bg-[#b45309] transition-all shadow-md active:scale-95 disabled:opacity-70 min-w-[140px] flex justify-center items-center"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </span>
                ) : (
                  'Guardar Perfil'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}