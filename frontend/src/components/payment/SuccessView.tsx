"use client";

import React from "react";
import { useRouter } from "next/navigation";

export function SuccessView() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-green-50 dark:bg-green-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-green-200 dark:border-green-800">
        <div className="text-green-600 text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          Pago Exitoso
        </h2>
        <p className="text-stone-600 dark:text-stone-400 mb-6">
          Tu transacción ha sido confirmada. ¡Gracias por tu compra!
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
