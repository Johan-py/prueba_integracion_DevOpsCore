import { useState, useEffect } from "react";
import { PaymentStatus } from "@/types/payment";

export function usePaymentStatus(
  paymentId: string | null,
  onComplete?: () => void,
  pollInterval = 3000,
) {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!paymentId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const checkStatus = async () => {
      try {
        // Simulación de API; reemplazar con fetch real
        const mockResponse = await new Promise<{ estado: PaymentStatus }>(
          (resolve) => {
            setTimeout(() => {
              resolve({ estado: "pendiente" });
            }, 8000);
          },
        );

        if (!isMounted) return;

        setStatus(mockResponse.estado);
        setIsLoading(false);

        if (mockResponse.estado === "pagado" && onComplete) {
          onComplete();
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        if (isMounted) setIsLoading(false);
      }
    };

    const intervalId = setInterval(checkStatus, pollInterval);

    checkStatus();

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [paymentId, onComplete, pollInterval]);

  return { status, isLoading };
}
