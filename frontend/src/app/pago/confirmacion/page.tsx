'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Mail, Home } from 'lucide-react'
import Stepper from '@/components/ui/Stepper'
import { PaymentData } from '@/types/payment'

export default function ConfirmacionPage() {
  const router = useRouter()
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [fecha] = useState(() =>
    new Date().toLocaleString('es-BO', { dateStyle: 'long', timeStyle: 'short' })
  )

  useEffect(() => {
    const stored = localStorage.getItem('currentPayment')
    if (stored) {
      try {
        setPayment(JSON.parse(stored) as PaymentData)
      } catch {}
      localStorage.removeItem('currentPayment')
    }
  }, [])

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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle size={44} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">¡Pago confirmado!</h1>
          <p className="text-stone-500 leading-relaxed">
            Tu suscripción ha sido activada. Hemos enviado el comprobante a tu correo electrónico.
          </p>
        </div>

        {payment && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-4">
            <h3 className="font-semibold text-stone-800 mb-4">Detalle de la transacción</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Plan</span>
                <span className="font-medium text-stone-800">{payment.planNombre ?? 'Plan contratado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Subtotal</span>
                <span className="text-stone-700">Bs. {Number(payment.subtotal ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">IVA (13%)</span>
                <span className="text-stone-700">Bs. {Number(payment.iva_monto ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-green-600 pt-2 border-t border-stone-100">
                <span>Total pagado</span>
                <span>Bs. {Number(payment.monto).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-100">
                <span className="text-stone-500">Referencia</span>
                <span className="font-mono text-xs text-stone-700">#{payment.referencia}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Fecha</span>
                <span className="text-stone-700">{fecha}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-green-50 rounded-2xl border border-green-200 p-4 mb-6">
          <div className="flex items-start gap-3">
            <Mail size={18} className="text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Comprobante enviado a tu correo</p>
              <p className="text-xs text-green-700 mt-1 leading-relaxed">
                Recibirás un email con el comprobante en PDF adjunto. Revisa tu bandeja de entrada o spam si no lo encuentras.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          <Home size={16} />
          Ir al inicio
        </button>
      </div>
    </main>
  )
}
