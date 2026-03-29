"use client";

import { useEffect, useState } from "react";

export default function ConsumoPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      
      setData({
        usadas: 2,
        limite: 10,
        plan: "Gratis",
      });

     
       //setError(true);

      setLoading(false);
    }, 1500);
  }, []);

 
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

 
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-xl shadow">
          No pudimos cargar tu información, intenta de nuevo
        </div>
      </div>
    );
  }

  const porcentaje = (data.usadas / data.limite) * 100;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Panel de Consumo
          </h1>

          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
            Plan: {data.plan}
          </span>
        </div>

        {/* mensajito */}
        {data.usadas >= data.limite ? (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            No te quedan publicaciones gratuitas. Compra una suscripción para seguir publicando.
          </div>
        ) : (
          <p className="text-gray-600 mb-4">
            Has usado {data.usadas} de {data.limite} publicaciones este mes
          </p>
        )}

        {/* la barra */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-4 transition-all duration-700 ease-in-out"
            style={{
              width: `${porcentaje}%`,
              background:
                porcentaje >= 100
                  ? "red"
                  : porcentaje >= 80
                  ? "orange"
                  : "green",
            }}
          />
        </div>

        {/* BOTÓN */}
        <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          Ver catálogo de suscripciones
        </button>
      </div>
    </div>
  );
}