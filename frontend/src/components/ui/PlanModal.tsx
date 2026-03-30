"use client"

import React from 'react'

// Definimos las propiedades que necesita el modal para funcionar
interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlanModal({ isOpen, onClose }: PlanModalProps) {
  // Si no está abierto, no renderizamos nada
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl md:p-10">
        
        {/* Botón de cerrar (la X) */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-stone-900">¡Elige tu Plan y Sigue Publicando!</h2>
          <p className="mt-2 text-stone-600">Has alcanzado el límite de tu plan actual. Mejora para llegar a más clientes.</p>
        </div>

        {/* Contenedor de las 3 tarjetas */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          {/* Plan Básico */}
          <div className="rounded-xl border border-stone-200 p-6 text-center hover:border-amber-500 transition">
            <h3 className="text-xl font-semibold text-stone-800">Gratuito</h3>
            <p className="my-4 text-3xl font-bold text-stone-900">Bs. 0<span className="text-sm font-normal text-stone-500">/mes</span></p>
            <ul className="mb-6 space-y-2 text-sm text-stone-600 text-left">
              <li>✔️ 3 Publicaciones activas</li>
              <li>✔️ Soporte estándar</li>
              <li>❌ Destacado en búsquedas</li>
            </ul>
            <button disabled className="w-full rounded-lg bg-stone-100 py-2 text-stone-500 font-medium cursor-not-allowed">
              Plan Actual
            </button>
          </div>

          {/* Plan Pro (Destacado) */}
          <div className="rounded-xl border-2 border-amber-500 bg-amber-50 p-6 text-center shadow-lg relative transform md:-translate-y-4">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              MÁS POPULAR
            </div>
            <h3 className="text-xl font-semibold text-amber-900">Pro</h3>
            <p className="my-4 text-3xl font-bold text-stone-900">Bs. 50<span className="text-sm font-normal text-stone-500">/mes</span></p>
            <ul className="mb-6 space-y-2 text-sm text-stone-700 text-left">
              <li>✔️ 15 Publicaciones activas</li>
              <li>✔️ Soporte prioritario</li>
              <li>✔️ Destacado en búsquedas</li>
            </ul>
            <button className="w-full rounded-lg bg-amber-500 py-2 text-white font-bold hover:bg-amber-600 transition shadow-md">
              Elegir Plan Pro
            </button>
          </div>

          {/* Plan Premium */}
          <div className="rounded-xl border border-stone-200 p-6 text-center hover:border-amber-500 transition">
            <h3 className="text-xl font-semibold text-stone-800">Premium</h3>
            <p className="my-4 text-3xl font-bold text-stone-900">Bs. 120<span className="text-sm font-normal text-stone-500">/mes</span></p>
            <ul className="mb-6 space-y-2 text-sm text-stone-600 text-left">
              <li>✔️ Publicaciones ilimitadas</li>
              <li>✔️ Soporte 24/7</li>
              <li>✔️ Súper destacado (Top 1)</li>
            </ul>
            <button className="w-full rounded-lg bg-stone-900 py-2 text-white font-medium hover:bg-stone-800 transition">
              Elegir Premium
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}