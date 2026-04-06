import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useCancelPayment() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Abrir/cerrar modal
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  // Confirmar cancelación: navega al inicio
  const confirmCancel = () => {
    setIsModalOpen(false)
    router.push('/')
  }

  // Cerrar con tecla Escape
  useEffect(() => {
    if (!isModalOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isModalOpen])

  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isModalOpen])

  return { isModalOpen, openModal, closeModal, confirmCancel }
}
