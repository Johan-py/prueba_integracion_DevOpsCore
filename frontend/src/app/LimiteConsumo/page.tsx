"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart2, Zap, AlertTriangle } from "lucide-react";

type ConsumoData = {
  usadas: number;
  limite: number;
  plan: string;
};

export default function LimiteConsumoPage() {
  const router = useRouter();
  const [data, setData] = useState<ConsumoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/sign-in");
      return;
    }

    const fetchConsumo = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/consumo/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            router.replace("/sign-in");
            return;
          }
          throw new Error(`Error ${response.status}`);
        }

        const json: ConsumoData = await response.json();
        setData(json);
      } catch (err) {
        console.error("Error cargando consumo:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchConsumo();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E87B00] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tu panel de consumo...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 px-6 py-4 rounded-xl shadow mb-4">
            No pudimos cargar tu información, intenta de nuevo
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const porcentaje = data.limite > 0 ? (data.usadas / data.limite) * 100 : 0;
  const disponibles = data.limite - data.usadas;
  const limitado = data.usadas >= data.limite && data.limite > 0;

  let colorBarra = "bg-green-500";
  let mensaje = "Consumo normal";

  if (limitado) {
    colorBarra = "bg-red-500";
    mensaje = "Límite alcanzado";
  } else if (porcentaje >= 80) {
    colorBarra = "bg-yellow-400";
    mensaje = "Casi sin cupo disponible";
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Panel de consumo
              </h1>
            </div>
            <p className="text-gray-500 text-sm">
              Monitorea tus publicaciones activas y el límite de tu plan
            </p>
          </div>

          <div className="flex items-center gap-3">
            {data.plan && (
              <span className="bg-[#4B4B4B] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                {data.plan}
              </span>
            )}
            <Link href="/cobros-suscripciones">
              <button className="bg-[#E87B00] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors">
                Ver planes de ampliación
              </button>
            </Link>
          </div>
        </div>

        {/* NOTIFICACIÓN PUBLICACIONES RESTANTES */}
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl mb-6 flex items-center gap-3">
          <Zap size={18} className="text-yellow-600 shrink-0" />
          <span className="text-sm">
            Tienes publicaciones restantes este mes. Te quedan{" "}
            <strong>{disponibles}</strong>.
          </span>
        </div>

        {/* TARJETA PRINCIPAL */}
        <div className="bg-gradient-to-r from-black to-[#E87B00] text-white p-6 rounded-xl shadow mb-6">
          <p className="text-sm opacity-70 mb-2 uppercase tracking-wide">
            Publicaciones usadas este mes
          </p>

          <h2 className="text-4xl font-bold mb-4">
            {data.usadas}{" "}
            <span className="text-2xl opacity-70">/ {data.limite}</span>
          </h2>

          {/* BARRA DE PROGRESO */}
          <div className="w-full bg-white/20 rounded-full h-3 mb-3">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${colorBarra}`}
              style={{ width: `${Math.min(porcentaje, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold opacity-90">{mensaje}</p>
            <p className="text-sm opacity-70">{Math.round(porcentaje)}% utilizado</p>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
            <BarChart2 className="mx-auto mb-2 text-blue-500" size={22} />
            <h3 className="text-blue-600 text-2xl font-bold">{disponibles}</h3>
            <p className="text-gray-500 text-sm mt-1">Disponibles</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
            <BarChart2 className="mx-auto mb-2 text-green-500" size={22} />
            <h3 className="text-green-600 text-2xl font-bold">{data.usadas}</h3>
            <p className="text-gray-500 text-sm mt-1">Usadas</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
            <BarChart2 className="mx-auto mb-2 text-[#E87B00]" size={22} />
            <h3 className="text-[#E87B00] text-2xl font-bold">{data.limite}</h3>
            <p className="text-gray-500 text-sm mt-1">Límite mensual</p>
          </div>
        </div>

        {/* ALERTA LÍMITE ALCANZADO */}
        {limitado && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="shrink-0" />
              <span className="text-sm font-medium">
                Has alcanzado el límite de publicaciones de tu plan actual.
              </span>
            </div>
            <Link href="/cobros-suscripciones">
              <button className="bg-[#E87B00] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors whitespace-nowrap">
                Ampliar plan
              </button>
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
