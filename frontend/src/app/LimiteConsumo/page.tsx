"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ConsumoPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/consumo/1");

        if (!res.ok) {
          throw new Error("Error en la API");
        }

        const json = await res.json();

        setData(json);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-xl shadow mb-4">
          No pudimos cargar tu información, intenta de nuevo
        </div>

        {/* Este es para que salga un boton de reintentar */}
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const porcentaje = (data.usadas / data.limite) * 100;
  const disponibles = data.limite - data.usadas;

  let colorBarra = "bg-green-500";
  let colorTexto = "text-green-600";
  let mensaje = "Consumo normal";

  if (data.usadas >= 9) {
    colorBarra = "bg-red-500";
    colorTexto = "text-red-600";
    mensaje = "Límite alcanzado";
  } else if (data.usadas >= 5) {
    colorBarra = "bg-yellow-400";
    colorTexto = "text-yellow-600";
    mensaje = "Casi sin cupo disponible";
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* esto es para la parte de arriba  */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel de consumo</h1>
        <Link href="/cobros-suscripciones">
          <button className="bg-gradient-to-r from-black to-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-900 transition">
            Ver planes de ampliación
          </button>
        </Link>
      </div>

      {/* Esto es para el mensaje que dice cuando le queda por usar */}
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6">
        Tienes publicaciones restantes este mes. Te queda {disponibles}.
      </div>

      {/* Esto es para la tarjeta del medio que cambia de color */}
      <div className="bg-gradient-to-r from-black to-orange-500 text-white p-6 rounded-xl shadow mb-6">
        <p className="text-sm opacity-80 mb-2">PUBLICACIONES USADAS ESTE MES</p>

        <h2 className="text-4xl font-bold mb-4">
          {data.usadas} / {data.limite}
        </h2>

        {/* Esto es para la barra del medio que cambia por cuanto uso */}
        <div className="w-full bg-gray-300 rounded-full h-3 mb-4">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${colorBarra}`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>

        <p className={`text-sm font-semibold ${colorTexto}`}>{mensaje}</p>
      </div>

      {/* Esto es para lo que esta abajo de la tarjeta que cambia de color */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h3 className="text-green-600 text-xl font-bold">{disponibles}</h3>
          <p>Disponibles</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h3 className="text-orange-600 text-xl font-bold">{data.usadas}</h3>
          <p>Usadas</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h3 className="text-blue-600 text-xl font-bold">{data.limite}</h3>
          <p>Límite</p>
        </div>
      </div>

      {/* Esto sale cuando esta de 10/10 en uso */}
      {data.usadas >= data.limite && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg flex justify-between items-center">
          <span>Sin cupo restante</span>
          <Link href="/cobros-suscripciones">
            <button className="bg-gradient-to-r from-black to-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-900 transition">
              Ampliar plan
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
