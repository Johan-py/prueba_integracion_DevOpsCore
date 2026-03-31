import { useState, useEffect } from "react";
import { PaymentData } from "@/types/payment";

export function useCurrentPayment() {
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        // Endpoint real: /api/payment/current
        // Por ahora usamos un mock con setTimeout
        const mockPayment: PaymentData = {
          id: "PAY-2024-00847",
          monto: 10.0,
          referencia: "PAY-2024-00847",
          qrContent: "https://tuapp.com/pagar/PAY-2024-00847",
          estado: "pendiente",
          fechaExpiracion: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        };

        // Simular latencia de red
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setPayment(mockPayment);
      } catch {
        setError("Error al cargar el pago");
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, []);

  return { payment, loading, error };
}
