import { useState, useEffect } from 'react'
import { PaymentStatus } from '@/types/payment'

export function usePaymentStatus(
  paymentId: string | null,
  onComplete?: () => void,
  pollInterval = 3000
) {
  const [status, setStatus] = useState<PaymentStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!paymentId) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    const checkStatus = async () => {
      try {
        // Preguntamos al backend el estado de este ID específico
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${API}/api/transacciones/${paymentId}/estado`)

        if (!response.ok) throw new Error('Error al consultar estado')

        const data = await response.json()

        if (!isMounted) return

        const estadoReal = data.estado.toLowerCase() as PaymentStatus
        setStatus(estadoReal)
        setIsLoading(false)

        if (estadoReal === 'pagado' && onComplete) {
          onComplete()
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
        if (isMounted) setIsLoading(false)
      }
    }

    const intervalId = setInterval(checkStatus, pollInterval)
    checkStatus() // Primera llamada inmediata

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [paymentId, onComplete, pollInterval])

  return { status, isLoading }
}
