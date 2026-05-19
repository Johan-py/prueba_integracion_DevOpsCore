'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Mail, CheckCircle } from 'lucide-react'
import Stepper from '@/components/ui/Stepper'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
const POLL_INTERVAL = 5000

export default function PagoPendientePage() {
  const router = useRouter()
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [planNombre, setPlanNombre] = useState<string | null>(null)
  const [referencia, setReferencia] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('currentPayment')
    if (!stored) {
      router.push('/cobros-suscripciones')
      return
    }
    try {
      const data = JSON.parse(stored)
      const id = String(data.id)
      setPaymentId(id)
      setPlanNombre(data.planNombre ?? null)
      setReferencia(data.referencia ?? null)

      // HU-14: notificar al admin que el usuario indicó haber realizado el pago
      const token = localStorage.getItem('token')
      if (token) {
        fetch(`${API_URL}/api/transacciones/${id}/notificar-admin`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {})
      }
    } catch {
      router.push('/cobros-suscripciones')
    }
  }, [router])

  useEffect(() => {
    if (!paymentId) return

    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/api/transacciones/${paymentId}/estado`)
        if (!res.ok) return
        const { estado } = await res.json()
        if (estado === 'pagado' || estado === 'completado') {
          clearInterval(intervalRef.current!)
          localStorage.removeItem('currentPayment')
          router.push('/pago/confirmacion')
        }
      } catch {
        // silencioso — reintenta en el próximo tick
      }
    }

    check()
    intervalRef.current = setInterval(check, POLL_INTERVAL)
    return () => clearInterval(intervalRef.current!)
  }, [paymentId, router])

  return (
    <main className="min-h-screen bg-stone-50 font-sans pb-16">
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Stepper />
          <span className="text-sm text-stone-400 hidden sm:block">PropBol Inmobiliaria</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 pt-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-4">
            <Clock size={44} className="text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Pago en revisión</h1>
          <p className="text-stone-500 leading-relaxed">
            Recibimos tu solicitud. Un administrador está verificando tu transferencia.
          </p>
        </div>

        {(planNombre || referencia) && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-4">
            <h3 className="font-semibold text-stone-800 mb-4">Detalle de la solicitud</h3>
            <div className="space-y-3 text-sm">
              {planNombre && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Plan</span>
                  <span className="font-medium text-stone-800">{planNombre}</span>
                </div>
              )}
              {referencia && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Referencia</span>
                  <span className="font-mono text-xs text-stone-700">#{referencia}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-stone-100">
                <span className="text-stone-500">Estado</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Pendiente de verificación
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 mb-4">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Esta página se actualiza automáticamente</p>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Cuando el administrador confirme tu pago, serás redirigido automáticamente a la pantalla de confirmación. No necesitas refrescar.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 mb-6">
          <div className="flex items-start gap-3">
            <Mail size={18} className="text-stone-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-stone-800">Recibirás un correo de confirmación</p>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Una vez aprobado el pago, te enviaremos el comprobante en PDF a tu correo registrado.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full border border-stone-200 hover:bg-stone-100 text-stone-700 py-3 rounded-xl font-semibold transition-colors text-sm"
        >
          Volver al inicio
        </button>
      </div>
    </main>
  )
}
