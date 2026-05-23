'use client'

import { useState, useEffect } from 'react'

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
    precio: 30,
    duracionDias: 30,
  },
  {
    id: 2,
    nombre: 'Plan Premium',
    descripcion: '60 días · Banner especial · Top 3 resultados',
    precio: 50,
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

const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
}

const getHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

export default function PromocionarModal({
  abierto,
  propiedadNombre,
  propiedadId,
  onConfirmar,
  onCancelar,
}: PromocionarModalProps) {
  const [paso, setPaso] = useState<'planes' | 'procesando' | 'verificacion' | 'aprobado' | 'error'>('planes')
  const [planSeleccionado, setPlanSeleccionado] = useState<Plan>(planes[0])
  const [error, setError] = useState('')
  const [transaccionId, setTransaccionId] = useState<number | null>(null)

  // Polling para verificar si la publicidad ya fue aprobada
  useEffect(() => {
    if (paso !== 'verificacion') return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${getApiUrl()}/api/publicaciones/${propiedadId}/publicitar/estado`, {
          headers: getHeaders()
        })
        const data = await response.json()
        
        if (data.ok && data.data?.promoted === true) {
          clearInterval(interval)
          setPaso('aprobado')
        }
      } catch (err) {
        console.error('Error verificando estado:', err)
      }
    }, 5000) // Verificar cada 5 segundos

    return () => clearInterval(interval)
  }, [paso, propiedadId])

  if (!abierto) return null

  const handleConfirmar = async () => {
    setPaso('procesando')
    setError('')
    
    try {
      const response = await fetch(`${getApiUrl()}/api/transacciones/publicidad/crear-sesion`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          publicacionId: propiedadId,
          planId: planSeleccionado.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la sesión de pago')
      }

      if (data.ok && data.data) {
        setTransaccionId(data.data.id)
        setPaso('verificacion')
      } else {
        throw new Error(data.message || 'Error al crear la sesión de pago')
      }
    } catch (err) {
      console.error('Error al crear sesión de pago:', err)
      setError(err instanceof Error ? err.message : 'Error al procesar el pago. Intenta nuevamente.')
      setPaso('error')
    }
  }

  const handleCancelar = () => {
    setPaso('planes')
    setError('')
    setTransaccionId(null)
    onCancelar()
  }

  const handleReintentar = () => {
    setPaso('planes')
    setError('')
    setTransaccionId(null)
  }

  const handleAprobado = () => {
    setPaso('planes')
    setTransaccionId(null)
    onCancelar()
    // Recargar la página para ver los cambios
    window.location.reload()
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
                        <p className="text-xl font-bold text-orange-600">{plan.precio} Bs</p>
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
        ) : paso === 'procesando' ? (
          <div className="px-6 pt-8 pb-4 text-center">
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Creando sesión de pago</h3>
            <p className="text-sm text-gray-500 mt-1">Preparando tu transacción...</p>
            <p className="text-xs text-gray-400 mt-4">Por favor, no cierres esta ventana</p>
          </div>
        ) : paso === 'verificacion' ? (
          <div className="px-6 pt-8 pb-6 text-center">
            <div className="text-5xl mb-3">⏳</div>
            <h3 className="text-xl font-bold text-gray-800">Pago pendiente</h3>
            <p className="text-sm text-gray-600 mt-2">
              Tu solicitud para destacar <span className="font-semibold">"{propiedadNombre}"</span> está pendiente de pago.
            </p>
            {transaccionId && (
              <p className="text-xs text-gray-500 mt-2">
                Referencia: <span className="font-mono">REF-{transaccionId}</span>
              </p>
            )}
            <div className="bg-yellow-50 rounded-lg p-4 mt-4 text-left">
              <p className="text-sm text-yellow-800 font-medium">📌 ¿Qué sigue?</p>
              <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                <li>✓ Realiza el pago según las instrucciones</li>
                <li>✓ Sube el comprobante de pago</li>
                <li>✓ El administrador revisará tu pago y activará la publicidad</li>
                <li>✓ Una vez aprobado, la propiedad aparecerá destacada</li>
              </ul>
            </div>
            <button
              onClick={handleCancelar}
              className="mt-6 w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Entendido
            </button>
          </div>
        ) : paso === 'aprobado' ? (
          <div className="px-6 pt-6 pb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">¡Pago aprobado!</h3>
            <p className="text-sm text-gray-600 mt-2">
              Tu propiedad <span className="font-semibold">"{propiedadNombre}"</span> ahora está destacada.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Aparecerá en los primeros resultados de búsqueda y en la sección Destacados del Home.
            </p>
            <button
              onClick={handleAprobado}
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-semibold text-white transition hover:from-orange-600 hover:to-orange-700"
            >
              Ver propiedad destacada
            </button>
          </div>
        ) : (
          <div className="px-6 pt-6 pb-6 text-center">
            <div className="text-5xl mb-3">❌</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Error en el pago</h3>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleReintentar}
                className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-semibold text-white transition hover:from-orange-600 hover:to-orange-700"
              >
                Reintentar
              </button>
              <button
                onClick={handleCancelar}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}