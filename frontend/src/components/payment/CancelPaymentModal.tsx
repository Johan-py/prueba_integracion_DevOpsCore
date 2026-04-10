"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface CancelPaymentModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CancelPaymentModal({
  isOpen,
  onConfirm,
  onCancel,
}: CancelPaymentModalProps) {
  if (!isOpen) return null;

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm"
      onClick={onCancel}
    >
      {/* Card — modal-enter definido en globals.css */}
      <div
        className="modal-enter relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cerrar (X) */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        {/* Ícono */}
        <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200">
          <AlertTriangle size={30} className="text-amber-500" />
        </div>

        {/* Título */}
        <h2 className="text-xl font-bold text-stone-900 mb-2">
          ¿Cancelar el pago?
        </h2>

        {/* Descripción */}
        <p className="text-sm text-stone-500 mb-1 leading-relaxed">
          Si salís ahora,{" "}
          <span className="font-medium text-stone-700">
            se cancelará la transacción
          </span>{" "}
          y tendrás que iniciar una nueva compra.
        </p>
        <p className="text-xs text-stone-400 mb-7">
          El código QR dejará de ser válido.
        </p>

        {/* Acciones */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onConfirm}
            className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold py-3 rounded-xl transition-all duration-150 text-sm"
          >
            Sí, cancelar pago
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 font-semibold py-3 rounded-xl transition-all duration-150 text-sm"
          >
            Seguir con el pago
          </button>
        </div>
      </div>
    </div>
  );
}
