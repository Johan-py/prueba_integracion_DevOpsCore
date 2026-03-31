export type PaymentStatus = "pendiente" | "pagado" | "expirado";

export interface PaymentData {
  id: string;
  monto: number;
  referencia: string; // número de referencia, se muestra debajo del QR
  qrContent: string; // contenido para generar el QR
  estado: PaymentStatus;
  fechaExpiracion: string; // ISO string
}
