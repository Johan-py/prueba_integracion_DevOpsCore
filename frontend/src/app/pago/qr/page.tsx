'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import Stepper from '@/components/ui/Stepper'
import { useCurrentPayment } from '@/hooks/payment/useCurrentPayment'
import { usePaymentStatus } from '@/hooks/payment/usePaymentStatus'
import { useCancelPayment } from '@/hooks/payment/useCancelPayment'

import { Timer } from '@/components/payment/Timer'
import { QRDisplay } from '@/components/payment/QRDisplay'
import { SuccessView } from '@/components/payment/SuccessView'
import { CancelPaymentModal } from '@/components/payment/CancelPaymentModal'
import { ArrowLeft } from 'lucide-react'

export default function PagoQRPage() {
  const router = useRouter()
  const { payment, loading, error } = useCurrentPayment()
  const { isModalOpen, openModal, closeModal, confirmCancel } = useCancelPayment()

  // FORZADO: 10 minutos de gracia para que no salga la pantalla roja
  const [timeLeft, setTimeLeft] = useState<number | null>(600)

  // Hook de estatus (le pasamos el ID si existe)
  const { status } = usePaymentStatus(payment?.id ?? null)

  useEffect(() => {
    if (!payment) return

    // Si ya se pagó, no necesitamos cronómetro
    if (status === 'pagado') return

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => (prev && prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(intervalId)
  }, [payment, status])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        Cargando pago...
      </div>
    )

  if (error || !payment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans p-4">
        <p className="text-red-500 mb-4 text-center font-bold">⚠️ No se encontró la transacción</p>
        <p className="text-stone-500 text-sm mb-6 text-center">
          Asegúrate de que en Prisma Studio el Usuario 1 tenga un registro PENDIENTE.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-stone-800 text-white px-6 py-2 rounded-lg font-medium"
        >
          Verificar de nuevo
        </button>
      </div>
    )
  }

  // Si el backend confirma que se pagó, mostramos éxito
  if (status === 'pagado') return <SuccessView />

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      <CancelPaymentModal isOpen={isModalOpen} onConfirm={confirmCancel} onCancel={closeModal} />

      <main className="min-h-screen bg-stone-50 font-sans pb-10">
        <div className="max-w-6xl mx-auto p-6">
          <Stepper />
        </div>

        <section className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden mt-4">
          <header className="px-6 pt-5">
            <button
              onClick={openModal}
              className="flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={18} />
              Volver
            </button>
          </header>

          <div className="p-6 border-b border-stone-100 text-center">
            <h1 className="text-xl font-medium text-stone-600">Total a pagar</h1>
            <p className="text-4xl font-bold text-stone-900 mt-2">Bs. {payment.monto.toFixed(2)}</p>
          </div>

          <div className="px-6 pt-6 pb-2 flex justify-center">
            {/* El cronómetro ahora será estable */}
            <Timer timeLeft={timeLeft ?? 600} formatTime={formatTime} />
          </div>

          <div className="px-6 py-8 flex justify-center bg-white">
            <QRDisplay
              value={payment.qrContent || 'PROBOL_TEST_TOKEN'}
              id={payment.referencia}
              size={220}
            />
          </div>
        </section>
      </main>
    </>
  )
}
