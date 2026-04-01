"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  // --- ESTO ES LO NUEVO ---
  const [datosPlan, setDatosPlan] = useState({ usadas: 0, total: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);

    // LLAMADA AL BACKEND
    const fetchPlan = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/plan-limit", {
          headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setDatosPlan({ usadas: data.usadas, total: data.total });
      } catch (err) {
        console.error("Error cargando plan", err);
      }
    };

    fetchPlan();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/25 z-50">
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      <div className="absolute w-[92%] h-[88%] bg-[#d9d9d9]/40 backdrop-blur-md rounded-2xl"></div>

      <div className="relative flex items-center justify-center w-full h-full">
        <div className={`bg-[#eeeeee] rounded-2xl px-7 py-8 w-[360px] text-center shadow-md transform transition-all duration-300
          ${visible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
          
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100">
              <span className="text-red-500 text-2xl">🚫</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-700 leading-tight">Límite alcanzado</h2>

          <p className="text-sm text-gray-600 mt-3 leading-relaxed px-2">
            Has alcanzado el límite de tus publicaciones gratuitas de este mes.
          </p>

          {/* --- AQUÍ USAMOS LOS DATOS REALES --- */}
          <div className="mt-5 bg-[#e5e5e5] rounded-lg px-4 py-3 flex items-center justify-between">
            <div className="text-left">
              <p className="text-gray-700 text-sm">Tus publicaciones restantes:</p>
              <p className="text-red-500 font-semibold text-sm">
                {datosPlan.usadas} de {datosPlan.total} utilizadas
              </p>
            </div>
            <div className="w-8 h-8 flex items-center justify-center bg-orange-200 rounded-md">🔒</div>
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