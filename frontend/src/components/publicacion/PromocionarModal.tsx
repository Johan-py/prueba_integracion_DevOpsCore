'use client'

import { useState } from 'react'

interface Plan {
  id: number
  nombre: string
  descripcion: string
  precio: number
  duracionDias: number
  popular?: boolean
}

const planes: Plan[] = [
  {
    id: 1,
    nombre: 'Plan Básico',
    descripcion: '30 días destacado · Posición prioritaria',
    precio: 9.99,
    duracionDias: 30,
  },
  {
    id: 2,
    nombre: 'Plan Premium',
    descripcion: '60 días · Banner especial · Top 3 resultados',
    precio: 19.99,
    duracionDias: 60,
    popular: true,
  },
]

interface PromocionarModalProps {
  abierto: boolean
  propiedadNombre: string
  propiedadId: number
  onConfirmar: (propiedadId: number, planId: number, precio: number) => Promise<void>
  onCancelar: () => void
}

export default function PromocionarModal({
  abierto,
  propiedadNombre,
  propiedadId,
  onConfirmar,
  onCancelar,
}: PromocionarModalProps) {
  const [paso, setPaso] = useState<'planes' | 'procesando'>('planes')
  const [planSeleccionado, setPlanSeleccionado] = useState<Plan>(planes[0])
  const [error, setError] = useState('')

  if (!abierto) return null

  const handleConfirmar = async () => {
    setPaso('procesando')
    setError('')
    try {
      await onConfirmar(propiedadId, planSeleccionado.id, planSeleccionado.precio)
      setPaso('planes')
    } catch (err) {
      console.error(err)
      setError('Error al procesar el pago. Intenta nuevamente.')
      setPaso('planes')
    }
  }

  const handleCancelar = () => {
    setPaso('planes')
    setError('')
    onCancelar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl mx-4">
        {paso === 'planes' ? (
          <>
            <div className="px-6 pt-5 pb-2 text-center">
              <div className="text-5xl mb-3">🚀</div>
              <h2 className="text-xl font-bold text-gray-800">Publicitar propiedad</h2>
              <p className="text-sm text-gray-600 mt-1">
                Elige un plan para destacar <span className="font-semibold">"{propiedadNombre}"</span>
              </p>
            </div>

            <hr className="h-[2px] bg-gray-800" />

            <div className="px-4 py-4">
              <div className="space-y-3 mb-4">
                {planes.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setPlanSeleccionado(plan)}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      planSeleccionado.id === plan.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2 left-4 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Más popular
                      </span>
                    )}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-800">{plan.nombre}</h3>
                        <p className="text-xs text-gray-500">{plan.descripcion}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-orange-600">${plan.precio} USD</p>
                        <p className="text-xs text-gray-400">{plan.duracionDias} días</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center mb-3">{error}</p>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirmar}
                  className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-semibold text-white transition hover:from-orange-600 hover:to-orange-700"
                >
                  Continuar al pago
                </button>

                <button
                  onClick={handleCancelar}
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="px-6 pt-8 pb-4 text-center">
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Procesando pago</h3>
            <p className="text-sm text-gray-500 mt-1">Validando tu transacción...</p>
            <p className="text-xs text-gray-400 mt-4">Por favor, no cierres esta ventana</p>
          </div>
        )}
      </div>
    </div>
  )
}