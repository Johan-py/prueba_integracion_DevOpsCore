import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ExpiredViewProps {
  planId?: string
}

export function ExpiredView({ planId }: ExpiredViewProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (countdown <= 0) {
      router.push(planId ? `/pago/resumen?planId=${planId}` : '/cobros-suscripciones')
      return
    }
    const id = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [countdown, planId, router])

  return (
    <div className="min-h-screen bg-red-50 dark:bg-red-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-200 dark:border-red-800">
        <div className="text-red-600 text-6xl mb-4">⏰</div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          Tiempo agotado
        </h2>
        <p className="text-stone-600 dark:text-stone-400 mb-6">
          La compra ha sido cancelada automáticamente.
        </p>
        <p className="text-sm text-stone-400">
          Redirigiendo al selector de métodos de pago en {countdown}...
        </p>
      </div>
    </div>
  )
}
