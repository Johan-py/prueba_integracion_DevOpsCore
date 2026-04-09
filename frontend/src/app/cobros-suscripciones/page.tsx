'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Plan = {
  id: number
  name: string
  price: number
  description: string
  comment: string
  benefits: string[]
  subscribers: number
}

const plansData: Plan[] = [
  {
    id: 1,
    name: 'Básico',
    price: 59,
    description: 'Ideal para comenzar',
    comment: 'Perfecto para empezar y explorar nuestras funciones esenciales sin complicaciones.',
    benefits: ['Acceso limitado', 'Soporte básico', '1 usuario'],
    subscribers: 25
  },
  {
    id: 2,
    name: 'Estándar',
    price: 99,
    description: 'Para usuarios intermedios',
    comment:
      'La opción más elegida para empresas pequeñas: balance perfecto entre funciones y precio.',
    benefits: ['Acceso completo', 'Soporte prioritario', '5 usuarios'],
    subscribers: 60
  },
  {
    id: 3,
    name: 'Pro',
    price: 199,
    description: 'Máximo rendimiento',
    comment:
      'Todo incluido, ideal para usuarios avanzados o empresas que buscan máximo rendimiento.',
    benefits: ['Todo incluido', 'Soporte 24/7', 'Usuarios ilimitados'],
    subscribers: 10
  }
]

export default function CobrosSuscripciones() {
  const [plans] = useState(plansData)
  const maxSubscribers = Math.max(...plans.map((plan) => plan.subscribers))
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-10 font-inter">
      <h1 className="text-4xl font-bold text-stone-900 mb-10">Planes de Suscripción</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="relative bg-white rounded-2xl p-6 shadow-md border border-stone-200 w-72 flex flex-col justify-between"
          >
            {plan.subscribers === maxSubscribers && (
              <div className="absolute -top-2 right-2 bg-yellow-400 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                Suscripción más popular
              </div>
            )}

            <div>
              <h2 className="text-3xl font-semibold text-stone-900 mb-2">{plan.name}</h2>

              <p className="text-xl font-bold text-amber-600 mb-2">
                Bs. {plan.price}
                <span className="text-sm text-stone-600"> / mes</span>
              </p>

              <p className="text-base text-stone-600 mb-4">{plan.description}</p>
            </div>

            <ul className="mb-2 space-y-1 pl-4">
              {plan.benefits.map((b, i) => (
                <li key={i} className="text-base text-stone-600 list-disc">
                  {b}
                </li>
              ))}
            </ul>

            <p className="text-base text-stone-600 mb-4">{plan.comment}</p>

            <div className="flex flex-col gap-2 mt-auto">
              <button
                className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg transition"
                onClick={() => router.push(`/pago/resumen?planId=${plan.id}`)}
              >
                Suscribirse
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
