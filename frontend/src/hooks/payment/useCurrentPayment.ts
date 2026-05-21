import { useState, useEffect } from 'react'
import { PaymentData } from '@/types/payment'

export function useCurrentPayment() {
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        let userId = 1
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            userId = payload.id ?? payload.userId ?? payload.sub ?? 1
          } catch { /* token malformado, usar fallback */ }
        }
        const response = await fetch(`${API}/api/transacciones/pendiente/${userId}`, {
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) throw new Error('Error al obtener la transacción')

        const data = await response.json()

        const realPayment: PaymentData = {
          id: data.id,
          monto: data.monto,
          referencia: data.referencia,
          qrContent: data.qrContent,
          estado: data.estado,
          fechaExpiracion: data.fechaExpiracion,
          planNombre: data.planNombre ?? undefined,
          subtotal: data.subtotal ?? undefined,
          iva_monto: data.iva_monto ?? undefined,
          planId: data.planId != null ? String(data.planId) : undefined,
          tipoFacturacion: data.tipoFacturacion ?? undefined,
        }

        setPayment(realPayment)
      } catch (_err) {
        setError('Error al cargar el pago')
      } finally {
        setLoading(false)
      }
    }
    fetchPayment()
  }, [])
  return { payment, loading, error }
}
