'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ResumenTransaccion from '@/components/pago/resumenTransaccion';
import BotonQrBancario from '@/components/pago/botonQrBancario';

export default function PaginaResumenCompra() {
  const searchParams = useSearchParams();
  const planIdParam = searchParams.get('planId'); // string | null
  const [transaccion, setTransaccion] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validar que el parámetro exista
    if (!planIdParam) {
      setError('No se especificó un plan');
      setCargando(false);
      return;
    }

    // Convertir a número
    const idSuscripcion = parseInt(planIdParam, 10);
    if (isNaN(idSuscripcion)) {
      setError('ID de plan inválido');
      setCargando(false);
      return;
    }

    async function iniciarTransaccion() {
      try {
        const respuesta = await fetch('/api/transacciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idSuscripcion }),
        });
        if (!respuesta.ok) {
          const errorData = await respuesta.json();
          throw new Error(errorData.error || 'Error al crear la transacción');
        }
        const datos = await respuesta.json();
        setTransaccion(datos);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    iniciarTransaccion();
  }, [planIdParam]);

  if (cargando) return <div className="text-center py-10 text-gray-600">Cargando resumen...</div>;
  if (error) return <div className="text-center py-10 text-red-600">Error: {error}</div>;
  if (!transaccion) return null;

  const imagenQrUrl = transaccion.plan_suscripcion?.imagen_gr_url || '';

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white font-sans">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Resumen de compra</h1>
      <p className="text-gray-500 mb-6">Verifica tu pedido antes de proceder al pago</p>
      <ResumenTransaccion transaccion={transaccion} />
      <BotonQrBancario imagenQrUrl={imagenQrUrl} total={transaccion.total} />
      <div className="mt-6 text-center text-xs text-gray-400">Pago seguro: SSI, 256-bit · Encriptado</div>
    </div>
  );
}