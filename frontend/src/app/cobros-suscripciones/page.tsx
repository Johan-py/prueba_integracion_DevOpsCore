"use client";

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ArrowRight } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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
    price: 0,
    description: 'Ideal para comenzar',
    comment: 'Perfecto para empezar y explorar nuestras funciones esenciales sin complicaciones.',
    benefits: ['2 publicaciones activas', 'Acceso limitado', 'Soporte basico', '1 usuario'],
    subscribers: 25
  },
  {
    id: 2,
    name: 'Estándar',
    price: 99,
    description: 'Para usuarios intermedios',
    comment:
      'La opcion mas elegida para empresas pequeñas: balance perfecto entre funciones y precio.',
    benefits: ['10 publicaciones activas', 'Acceso completo', 'Soporte prioritario', '5 usuarios'],
    subscribers: 60
  },
  {
    id: 3,
    name: 'Pro',
    price: 199,
    description: 'Maximo rendimiento',
    comment:
      'Todo incluido, ideal para usuarios avanzados o empresas que buscan maximo rendimiento.',
    benefits: ['Publicaciones ilimitadas', 'Todo incluido', 'Soporte 24/7', 'Usuarios ilimitados'],
    subscribers: 10
  }
]

export default function CobrosSuscripciones() {
  const [plans] = useState(plansData)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPlanId, setCurrentPlanId] = useState<number>(1)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (token && token !== 'undefined' && token !== 'null') {
      setIsLoggedIn(true)

      fetch(`${API_URL}/api/suscripciones/mi-suscripcion`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.activa && typeof data.idSuscripcion === 'number') {
            setCurrentPlanId(data.idSuscripcion)
          }
        })
        .catch(() => {})
    }
  }, [])

  const maxSubscribers = Math.max(...plans.map((p) => p.subscribers))
  const mostPopularId = plans.find((p) => p.subscribers === maxSubscribers)?.id

  const handleSubscription = (plan: Plan) => {
    const token = localStorage.getItem('token')

    const url = `/pago/resumen?planId=${plan.id}&precio=${plan.price}`

    if (!token || token === 'undefined' || token === 'null') {
      localStorage.setItem('redirectAfterLogin', '/cobros-suscripciones')
      localStorage.setItem('selectedPlan', JSON.stringify(plan))
      router.push('/sign-in')
      return
    }

    router.push(url)
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black flex justify-center px-4 py-6 sm:p-10 font-inter">
      <div className="w-full max-w-6xl">
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 dark:text-white">Planes de membresía</h1>

          <p className="text-sm sm:text-base md:text-lg text-stone-400 dark:text-[#999] mt-2">
            Amplia tu alcance en el mercado inmobiliario de Bolivia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative p-4 sm:p-6 w-full flex flex-col justify-between
                rounded-3xl border transition-all duration-300
                bg-white dark:bg-[#1a1a1a] border-stone-200 dark:border-[#333]
                hover:bg-amber-50 dark:hover:bg-amber-900/10
                hover:border-amber-400 dark:hover:border-amber-500
                hover:shadow-2xl
                hover:-translate-y-1
                ${plan.id === mostPopularId ? 'border-amber-400 shadow-lg' : ''}
              `}
            >
              {plan.id === mostPopularId && (
                <div className="absolute -top-3 right-4 bg-amber-500 text-white text-xs px-3 py-1 rounded-full shadow">
                  MÁS POPULAR
                </div>
              )}

              {isLoggedIn && plan.id === currentPlanId && (
                <div className="absolute top-4 right-4 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                  Plan actual
                </div>
              )}

              <div>
                <h2 className="text-2xl font-semibold text-stone-900 dark:text-white mb-2">{plan.name}</h2>

                <p className="text-3xl font-bold text-amber-600 mb-2">
                  {plan.price === 0 ? 'Gratis' : `Bs. ${plan.price}`}
                  <span className="text-sm text-stone-500 dark:text-[#999]"> / mes</span>
                </p>

                <p className="text-sm text-stone-600 dark:text-[#999] mb-4">{plan.description}</p>
              </div>

              <ul className="space-y-2 mb-4">
                {plan.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-stone-700 dark:text-[#ccc]">
                    <span className="text-green-500 font-bold">✔</span>
                    {b}
                  </li>
                ))}
              </ul>

              <p className="text-sm text-stone-500 dark:text-[#999] mb-4">{plan.comment}</p>

              <button
                onClick={() => handleSubscription(plan)}
                disabled={isLoggedIn && plan.id === currentPlanId}
                className={`
                  p-2 rounded-xl text-white transition
                  ${
                    isLoggedIn && plan.id === currentPlanId
                      ? 'bg-stone-400 dark:bg-[#333] cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }
                `}
              >
                {isLoggedIn && plan.id === currentPlanId
                  ? 'Tu plan actual'
                  : 'Suscribirse'}
              </button>
            </div>
          ))}
        </div>

        {/* Banner de Suscripciones Anuales */}
        <div className="mt-12 p-4 sm:p-6 rounded-3xl bg-amber-50/50 dark:bg-[#1a1a1a] border border-amber-100 dark:border-[#333] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white dark:bg-[#222] rounded-2xl shadow-sm border border-amber-100 dark:border-[#333]">
              <Calendar className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">Tu suscripción actual</h3>
              <p className="text-stone-600 dark:text-[#999] text-sm max-w-md">
                Revisa cuántas publicaciones has usado este mes y el límite de tu plan.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/LimiteConsumo')}
            className="whitespace-nowrap px-8 py-3 bg-white dark:bg-[#222] border-2 border-amber-600/20 dark:border-amber-600/40 text-amber-700 dark:text-amber-400 rounded-2xl hover:bg-amber-100 dark:hover:bg-[#333] hover:border-amber-600/40 transition-all font-bold flex items-center gap-2 shadow-sm active:scale-95"
          >
            Ir al panel de consumo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
//// autenticado
