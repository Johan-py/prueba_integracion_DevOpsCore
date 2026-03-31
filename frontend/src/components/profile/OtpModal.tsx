'use client';

import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (otpCode: string) => void;
  onResendCode: () => void;
  // Permite inyectar errores desde el componente padre (ej. "Código incorrecto")
  externalError?: string; 
}

export default function OtpModal({ isOpen, onClose, onSubmit, onResendCode, externalError }: OtpModalProps) {
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 300 segundos = 5 minutos

  // Efecto para manejar el temporizador de 5 minutos
  useEffect(() => {
    if (!isOpen) {
      // Reiniciamos todo si el modal se cierra
      setOtp('');
      setLocalError('');
      setTimeLeft(300);
      return;
    }

    // Cuenta regresiva
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  // Formatear segundos a MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (timeLeft === 0) {
      setLocalError('El código ha expirado. Por favor, solicita uno nuevo.');
      return;
    }
    if (otp.length !== 4) {
      setLocalError('El código debe tener exactamente 4 dígitos.');
      return;
    }
    
    setLocalError('');
    onSubmit(otp);
  };

  const handleResend = () => {
    setTimeLeft(300); // Reiniciamos los 5 minutos
    setLocalError('');
    setOtp('');
    onResendCode();
  };

  // Función para cerrar si hacen clic en el fondo gris (Cumpliendo tu Criterio de Aceptación)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm mx-4 border-t-4 border-amber-600 flex flex-col items-center">
        
        <h2 className="text-xl font-bold mb-4 text-stone-900 text-center">
          Código de confirmación
        </h2>
        
        <p className="text-sm text-stone-600 mb-6 text-center">
          Hemos enviado un código OTP a tu nuevo correo.
          <br />
          <span className={`font-semibold ${timeLeft === 0 ? 'text-red-500' : 'text-amber-600'}`}>
            Expira en: {formatTime(timeLeft)}
          </span>
        </p>
        
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          {/* Contenedor del Input al estilo de tu wireframe */}
          <div className="relative mb-2 w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-6 w-6 text-stone-900" /> 
            </div>

            <input
              type="text"
              maxLength={4} // Limitamos a 4 dígitos según tus AC
              className="w-full border-2 border-stone-900 p-3 pl-12 rounded focus:outline-none focus:border-amber-600 text-center text-2xl tracking-[0.5em] font-bold text-stone-900"
              placeholder="****"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Solo permite números
            />
          </div>

          {/* Manejo de errores (locales o inyectados desde el backend) */}
          {(localError || externalError) && (
            <p className="text-red-500 text-xs mb-3 text-center">
              {localError || externalError}
            </p>
          )}
          
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-amber-600 hover:text-amber-700 underline mb-5"
          >
            Reenviar código
          </button>
          
          <div className="flex gap-3 w-full justify-center">
             <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-stone-900 bg-stone-100 rounded hover:bg-stone-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={timeLeft === 0}
              className={`px-6 py-2 text-white rounded font-medium transition-colors ${
                timeLeft === 0 ? 'bg-stone-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              Aceptar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}