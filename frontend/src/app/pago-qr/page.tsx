"use client";

import { useState, useEffect } from 'react';
import { useCurrentPayment } from '@/hooks/payment/useCurrentPayment';
import { usePaymentStatus } from '@/hooks/payment/usePaymentStatus';
import { useCancelPayment } from '@/hooks/payment/useCancelPayment';
import { Timer } from '@/components/payment/Timer';
import { QRDisplay } from '@/components/payment/QRDisplay';
import { ExpiredView } from '@/components/payment/ExpiredView';
import { SuccessView } from '@/components/payment/SuccessView';
import { CancelPaymentModal } from '@/components/payment/CancelPaymentModal';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PagoQRPage() {
  const router = useRouter();
  const { payment, loading, error } = useCurrentPayment();
  const { isModalOpen, openModal, closeModal, confirmCancel } = useCancelPayment();

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const getSecondsLeft = (expirationISO: string): number => {
    const expiration = new Date(expirationISO).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((expiration - now) / 1000));
  };

  useEffect(() => {
    if (!payment?.fechaExpiracion) return;
    if (payment.estado === 'pagado' || payment.estado === 'expirado') return;

    const updateCounter = () => {
      const remaining = getSecondsLeft(payment.fechaExpiracion);
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(intervalId);
    };

    updateCounter();
    const intervalId = setInterval(updateCounter, 1000);
    return () => clearInterval(intervalId);
  }, [payment]);

  const shouldPoll =
    payment?.id &&
    payment?.estado === 'pendiente' &&
    (timeLeft === null || timeLeft > 0);

  const { status } = usePaymentStatus(shouldPoll ? payment.id : null);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-stone-600">Cargando información de pago...</div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <p className="text-red-600">
            No se encontró un pago pendiente. Por favor, inicia una nueva compra.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-amber-600 text-white px-6 py-2 rounded-lg"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (payment.estado === 'expirado' || (timeLeft !== null && timeLeft <= 0)) {
    return <ExpiredView />;
  }

  if (status === 'pagado') {
    return <SuccessView />;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (timeLeft === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-stone-600">Preparando pago...</div>
      </div>
    );
  }

  return (
    <>
      <CancelPaymentModal
        isOpen={isModalOpen}
        onConfirm={confirmCancel}
        onCancel={closeModal}
      />

      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Botón de retroceso — abre modal de confirmación */}
          <div className="px-6 pt-5">
            <button
              onClick={openModal}
              className="flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors text-sm"
            >
              <ArrowLeft size={18} />
              Volver
            </button>
          </div>

          <div className="p-6 border-b border-stone-200">
            <h1 className="text-2xl font-bold text-stone-900">Monto a pagar</h1>
            <p className="text-4xl font-bold text-amber-600 mt-2">
              Bs. {payment.monto.toFixed(2)}
            </p>
          </div>

          <div className="px-6 pt-4 pb-2">
            <Timer timeLeft={timeLeft} formatTime={formatTime} />
          </div>

          <div className="px-6 py-6 flex justify-center">
            <QRDisplay
              value={payment.qrContent}
              id={payment.referencia}
              size={200}
            />
          </div>

        </div>
      </div>
    </>
  );
}
