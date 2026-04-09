'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ResumenTransaccion from '@/components/pago/resumenTransaccion'
import Stepper from '@/components/ui/Stepper'

export const dynamic = 'force-dynamic'

export default function PaginaResumenCompra() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-gray-600">Cargando resumen...</div>}>
      <ResumenCompraContenido />
    </Suspense>
  )
}

function ResumenCompraContenido() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planIdParam = searchParams.get('planId')

  const [transaccion, setTransaccion] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string | null>(null)

  const nombreMetodo: Record<string, string> = {
    qr: 'QR Bancario'
  }

  useEffect(() => {
    if (!planIdParam) {
      setError('No se especificó un plan')
      setCargando(false)
      return
    }

    const idSuscripcion = parseInt(planIdParam, 10)
    if (isNaN(idSuscripcion)) {
      setError('ID de plan inválido')
      setCargando(false)
      return
    }

    async function iniciarTransaccion() {
      try {
        const respuesta = await fetch('/api/transacciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idSuscripcion })
        })

        if (!respuesta.ok) {
          const errorData = await respuesta.json()
          throw new Error(errorData.error || 'Error al crear la transacción')
        }

        const datos = await respuesta.json()
        setTransaccion(datos)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear la transacción')
      } finally {
        setCargando(false)
      }
    }

    iniciarTransaccion()
  }, [planIdParam])

  const manejarContinuar = () => {
    if (metodoSeleccionado && transaccion) {
      router.push(`/pago/qr?transaccionId=${transaccion.id}`)
    }
  }

  if (cargando) {
    return <div className="text-center py-10 text-gray-600">Cargando resumen...</div>
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">Error: {error}</div>
  }

  if (!transaccion) return null

  const plan = transaccion.plan_suscripcion

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white font-sans">
      <div className="flex justify-between items-center mb-6">
        <Stepper />
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 text-sm">PropBol Inmobiliaria</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-2 text-gray-900">Resumen de compra</h1>
      <p className="text-gray-500 mb-6">Verifica tu pedido antes de realizar el pago</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="border border-gray-200 rounded-lg p-6 mb-6 shadow-md bg-white transition-shadow hover:shadow-lg">
            <div className="flex items-center mb-3">
              <span className="text-3xl mr-3">🏠</span>
              <h2 className="text-xl font-bold text-gray-900">Plan {plan.nombre_plan}</h2>
            </div>
            <p className="text-gray-600">
              {plan.nro_publicaciones_plan} publicaciones activas · Vigencia{' '}
              {plan.duración_plan_días} días · Galería {plan.fotos_galeria || 15} fotos
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">MÉTODO DE PAGO</h3>
            <div className="space-y-4">
              <div
                className={`flex items-start p-3 border rounded-lg cursor-pointer transition ${
                  metodoSeleccionado === 'qr'
                    ? 'border-green-500 bg-green-50 shadow-sm'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setMetodoSeleccionado('qr')}
              >
                <div className="flex-shrink-0 mr-4">
                  <span className="text-2xl">📱</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">Pago por QR</div>
                  <div className="text-sm text-gray-500">
                    Escanea con la aplicación bancaria de tu preferencia
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={manejarContinuar}
                  disabled={!metodoSeleccionado}
                  className={`w-full py-3 rounded-lg font-semibold transition shadow-md text-center ${
                    metodoSeleccionado
                      ? 'bg-green-700 text-white hover:bg-green-800'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continuar con{' '}
                  {metodoSeleccionado ? nombreMetodo[metodoSeleccionado] : 'un método de pago'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <ResumenTransaccion transaccion={transaccion} />
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-400">
        Pago seguro: SSI, 256-bit · Encriptado
      </div>
    </div>
  )
}
