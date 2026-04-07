export type PaymentStatus = 'pendiente' | 'pagado' | 'expirado' | 'cancelado'

export interface PaymentData {
  id: string
  monto: number
  referencia: string
  qrContent: string
  estado: PaymentStatus
  fechaExpiracion: string
}
