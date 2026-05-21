import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PaymentData } from '@/types/payment'

export function useCancelPayment(payment?: PaymentData | null) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const confirmCancel = async () => {
    setIsModalOpen(false)

    try {
      if (payment?.id) {
        await fetch(`/api/transacciones/${payment.id}/cancelar`, { method: 'PATCH' })
      }
    } catch {
      // No bloqueamos la navegación si la llamada falla
    }

    localStorage.removeItem('currentPayment')
    router.push(payment?.planId ? `/pago/resumen?planId=${payment.planId}` : '/cobros-suscripciones')
  }

  useEffect(() => {
    if (!isModalOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isModalOpen])

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isModalOpen])

  return { isModalOpen, openModal, closeModal, confirmCancel }
}
