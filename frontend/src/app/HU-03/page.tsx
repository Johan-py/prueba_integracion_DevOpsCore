"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/25 z-50">

      {/* OVERLAY */}
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      {/* FONDO PLOMO */}
      <div className="absolute w-[92%] h-[88%] bg-[#d9d9d9]/40 backdrop-blur-md rounded-2xl"></div>

      {/* CONTENEDOR */}
      <div className="relative flex items-center justify-center w-full h-full">

        {/* MODAL */}
        <div
          className={`bg-[#eeeeee] rounded-2xl px-7 py-8 w-[360px] text-center shadow-md transform transition-all duration-300
          ${visible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        >

          {/* ICONO */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100">
              <span className="text-red-500 text-2xl">🚫</span>
            </div>
          </div>

          {/* TITULO */}
          <h2 className="text-xl font-semibold text-gray-700 leading-tight">
            Límite alcanzado
          </h2>

          {/* TEXTO */}
          <p className="text-sm text-gray-600 mt-3 leading-relaxed px-2">
            Has alcanzado el límite de tus publicaciones gratuitas de este mes.
            Para continuar, amplía tu plan de membresía o revisa tus planes disponibles.
          </p>

          {/* CAJA INTERNA */}
          <div className="mt-5 bg-[#e5e5e5] rounded-lg px-4 py-3 flex items-center justify-between">
            <div className="text-left">
            <p className="text-gray-700 text-sm">
              Tus publicaciones restantes:
              </p>
              <p className="text-red-500 font-semibold text-sm">
              0 de 3 restantes
             </p>
             </div>
            <div className="w-8 h-8 flex items-center justify-center bg-orange-200 rounded-md">
              🔒
            </div>
          </div>

          {/* BOTÓN PRINCIPAL */}
          <button
            onClick={() => router.push("/planes")}
            className="mt-5 w-full py-2.5 rounded-lg text-white font-medium bg-orange-500 hover:bg-orange-600 transition"
          >
            💳 ¡Ver mis planes y ampliar cupo!
          </button>

          {/* BOTÓN SECUNDARIO */}
          <button
            onClick={() => router.push("/mis-publicaciones")}
            className="mt-3 w-full py-2.5 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-200 transition"
          >
            🏠 Volver a mis publicaciones
          </button>
        </div>
      </div>
    </div>
  );
}