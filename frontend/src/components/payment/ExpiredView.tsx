import React from "react";
import { useRouter } from "next/navigation";

export function ExpiredView() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-red-50 dark:bg-red-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-200 dark:border-red-800">
        <div className="text-red-600 text-6xl mb-4">⏰</div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          Tiempo agotado
        </h2>
        <p className="text-stone-600 dark:text-stone-400 mb-6">
          La compra ha sido cancelada automáticamente.
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
