
"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ResumenTransaccion from '@/components/pago/resumenTransaccion';
import Stepper from '@/components/ui/Stepper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ResumenCliente() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planIdParam = searchParams.get('planId');

  const [plan, setPlan] = useState<any>(null);
  const [transaccion, setTransaccion] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string | null>(null);
  const [codigoCupon, setCodigoCupon] = useState('');
  const [aplicandoCupon, setAplicandoCupon] = useState(false);
  const [mensajeCupon, setMensajeCupon] = useState<{ texto: string; error: boolean } | null>(null);

  const [tipoFacturacion, setTipoFacturacion] = useState<'mensual' | 'anual'>('mensual');
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);

  const nombreMetodo: Record<string, string> = { qr: 'QR Bancario', usdt: 'USDT TRC20' };

  const idSuscripcion = planIdParam ? parseInt(planIdParam, 10) : NaN;

  useEffect(() => {
    if (!planIdParam) {
      setError('No se especificó un plan');
      setCargando(false);
      return;
    }

    if (isNaN(idSuscripcion)) {
      setError('ID inválido');
      setCargando(false);
      return;
    }

    async function cargarPlan() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`${API_URL}/api/planes/${idSuscripcion}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!res.ok) throw new Error('No se pudo cargar el plan');

        const data = await res.json();
        setPlan(data);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setCargando(false);
      }
    }

    cargarPlan();
  }, [planIdParam, idSuscripcion]);

  async function obtenerOCrearTransaccion(): Promise<any> {
    if (transaccion) return transaccion;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch('/api/transacciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ idSuscripcion }),
    });

    if (!res.ok) throw new Error('Error al crear la transacción');

    const data = await res.json();
    setTransaccion(data);
    return data;
  }

  useEffect(() => {
    if (tipoFacturacion === 'anual') {
      setDescuentoPorcentaje(15);
    } else {
      setDescuentoPorcentaje(0);
    }
  }, [tipoFacturacion]);

  const calculos = useMemo(() => {
    if (!plan) {
      return {
        subtotalMensual: 0,
        subtotalAnual: 0,
        subtotalBase: 0,
        descuentoMonto: 0,
        totalFinal: 0,
        fechaInicio: '',
        fechaFin: '',
      };
    }

    const subtotalMensual = Number(plan.precio_plan || 0);
    const subtotalAnual = subtotalMensual * 12;

    const subtotalBase =
      tipoFacturacion === 'mensual'
        ? subtotalMensual
        : subtotalAnual;

    const descuentoMonto =
      (subtotalBase * descuentoPorcentaje) / 100;

    const descuentoCupon = Number(transaccion?.monto_descuento || 0);

    const totalFinal =
      subtotalBase - descuentoMonto - descuentoCupon;

    const fechaInicio = new Date();

    const fechaFin = new Date(fechaInicio);

    if (tipoFacturacion === 'mensual') {
      fechaFin.setMonth(fechaFin.getMonth() + 1);
    } else {
      fechaFin.setFullYear(fechaFin.getFullYear() + 1);
    }

    return {
      subtotalMensual,
      subtotalAnual,
      subtotalBase,
      descuentoMonto,
      totalFinal,
      fechaInicio: fechaInicio.toLocaleDateString(),
      fechaFin: fechaFin.toLocaleDateString(),
    };
  }, [plan, transaccion, tipoFacturacion, descuentoPorcentaje]);

  const manejarContinuar = async () => {
    if (!metodoSeleccionado || !plan) return;

    try {
      const t = await obtenerOCrearTransaccion();
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      await fetch(`/api/transacciones/${t.id}/actualizar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          tipoFacturacion,
          totalFinal: calculos.totalFinal,
        }),
      });

      if (metodoSeleccionado === 'usdt') {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const usdtRes = await fetch(`${API_URL}/api/usdt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ transaccionId: t.id }),
        });
        if (!usdtRes.ok) throw new Error('No se pudo iniciar el pago USDT');
        const usdtData = await usdtRes.json();
        localStorage.setItem('usdtPayment', JSON.stringify(usdtData));
        router.push(`/pago/usdt?transaccionId=${t.id}`);
      } else {
        router.push(`/pago/qr?transaccionId=${t.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'No se pudo iniciar el pago');
    }
  };

  const aplicarCupon = async () => {
    if (!codigoCupon.trim()) {
      setMensajeCupon({ texto: 'Ingresa un código', error: true });
      return;
    }

    setAplicandoCupon(true);

    try {
      const t = await obtenerOCrearTransaccion();

      const res = await fetch(`/api/transacciones/${t.id}/cupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: codigoCupon.trim(),
          totalOriginal: calculos.subtotalBase,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al aplicar cupón');

      setTransaccion((prev: any) => ({
        ...(prev ?? t),
        monto_descuento: data.monto_descuento,
      }));

      setMensajeCupon({
        texto: `¡Cupón aplicado! Descuento de Bs. ${data.monto_descuento}`,
        error: false,
      });

      setCodigoCupon('');
    } catch (err: any) {
      setMensajeCupon({
        texto: err.message || 'Error desconocido',
        error: true,
      });
    } finally {
      setAplicandoCupon(false);
    }
  };

  if (cargando)
    return <div className="text-center py-10 text-gray-600 dark:text-[#999]">Cargando...</div>;

  if (error)
    return <div className="text-center py-10 text-red-600 dark:text-red-400">Error: {error}</div>;

  if (!plan) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-black font-sans">
      <div className="flex justify-between items-center mb-6">
        <Stepper />
        <div className="text-gray-500 dark:text-[#999] text-sm">PropBol Inmobiliaria</div>
      </div>

      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
        Resumen de compra
      </h1>

      <p className="text-gray-500 dark:text-[#999] mb-6">
        Verifica tu pedido antes de realizar el pago
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div>
          <div className="border border-gray-200 dark:border-[#333] rounded-lg p-6 mb-6 shadow-md dark:bg-[#1a1a1a]">
            <div className="flex items-center mb-3">
              <span className="text-3xl mr-3">🏠</span>
              <h2 className="text-xl font-bold dark:text-white">
                Plan {plan.nombre_plan}
              </h2>
            </div>

            <p className="text-gray-600 dark:text-[#999]">
              {plan.nro_publicaciones_plan >= 1_000_000
                ? 'Publicaciones ilimitadas'
                : `${plan.nro_publicaciones_plan} publicaciones activas`}{' '}
              · Vigencia {plan.duracion_plan_dias ?? plan.duración_plan_días} días
            </p>
          </div>

          <div className="border border-gray-200 dark:border-[#333] rounded-lg p-6 mb-6 bg-white dark:bg-[#1a1a1a] shadow-md">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">
              TIPO DE FACTURACIÓN
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTipoFacturacion('mensual')}
                className={`p-4 rounded-lg border text-left transition ${
                  tipoFacturacion === 'mensual'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#222]'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white">Mensual</div>
                <div className="text-sm text-gray-500 dark:text-[#999]">
                  Pago mes a mes
                </div>
              </button>

              <button
                onClick={() => setTipoFacturacion('anual')}
                className={`p-4 rounded-lg border text-left transition ${
                  tipoFacturacion === 'anual'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#222]'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white">Anual</div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  15% de descuento
                </div>
              </button>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-[#333] rounded-lg p-6 bg-white dark:bg-[#1a1a1a] shadow-md">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">
              MÉTODO DE PAGO
            </h3>

            <div
              className={`flex items-start p-3 border rounded-lg cursor-pointer transition ${
                metodoSeleccionado === 'qr'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-[#222]'
              }`}
              onClick={() => setMetodoSeleccionado('qr')}
            >
              <span className="text-2xl mr-4">📱</span>
              <div>
                <div className="font-bold dark:text-white">Pago por QR</div>
                <div className="text-sm text-gray-500 dark:text-[#999]">Escanea con tu app bancaria</div>
              </div>
            </div>

            <div
              className={`flex items-start p-3 border rounded-lg cursor-pointer transition mt-3 ${
                metodoSeleccionado === 'usdt'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-[#222]'
              }`}
              onClick={() => setMetodoSeleccionado('usdt')}
            >
              <span className="text-2xl mr-4">💎</span>
              <div>
                <div className="font-bold dark:text-white">USDT TRC20</div>
                <div className="text-sm text-gray-500 dark:text-[#999]">Criptomoneda — Testnet Shasta</div>
              </div>
            </div>

            <button
              onClick={manejarContinuar}
              disabled={!metodoSeleccionado}
              className={`w-full mt-6 py-3 rounded-lg font-semibold transition shadow-md ${
                metodoSeleccionado
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-300 dark:bg-[#333] text-gray-500 dark:text-[#666] cursor-not-allowed'
              }`}
            >
              Continuar con{' '}
              {metodoSeleccionado
                ? nombreMetodo[metodoSeleccionado]
                : 'un método'}
            </button>

            <Link
              href="/cobros-suscripciones"
              className="block w-full text-center mt-4 py-2 rounded-lg border border-gray-300 dark:border-[#444] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#222] transition"
            >
              ← Volver a planes
            </Link>
          </div>
        </div>

        <div>
          <ResumenTransaccion
            transaccion={
              transaccion ?? {
                subtotal: Number(plan.precio_plan || 0) / 1.13,
                iva_monto:
                  Number(plan.precio_plan || 0) -
                  Number(plan.precio_plan || 0) / 1.13,
                total: Number(plan.precio_plan || 0),
                monto_descuento: 0,
              }
            }
          />

          <div className="mt-6 border border-gray-200 dark:border-[#333] rounded-lg p-6 bg-white dark:bg-[#1a1a1a] shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Resumen de facturación
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-[#999]">Tipo de facturación</span>
                <span className="font-medium capitalize dark:text-white">
                  {tipoFacturacion}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-[#999]">Subtotal mensual</span>
                <span>Bs. {calculos.subtotalMensual.toFixed(2)}</span>
              </div>

              {tipoFacturacion === 'anual' && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-[#999]">Subtotal anual</span>
                  <span>Bs. {calculos.subtotalAnual.toFixed(2)}</span>
                </div>
              )}

              {descuentoPorcentaje > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento anual ({descuentoPorcentaje}%)</span>
                  <span>- Bs. {calculos.descuentoMonto.toFixed(2)}</span>
                </div>
              )}

              {Number(transaccion?.monto_descuento || 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Cupón aplicado</span>
                  <span>
                    - Bs. {Number(transaccion?.monto_descuento).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-[#999]">Inicio</span>
                <span>{calculos.fechaInicio}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-[#999]">Fin</span>
                <span>{calculos.fechaFin}</span>
              </div>

              <div className="border-t dark:border-[#333] pt-3 flex justify-between font-bold text-base text-gray-900 dark:text-white">
                <span>Total</span>
                <span>Bs. {calculos.totalFinal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 border border-gray-200 dark:border-[#333] rounded-lg bg-gray-50 dark:bg-[#1a1a1a]">
            <label className="block text-sm font-medium text-gray-700 dark:text-[#999] mb-2">
              ¿Tienes un código de descuento?
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={codigoCupon}
                onChange={(e) => setCodigoCupon(e.target.value)}
                placeholder="Ej: DESCUENTO10"
                className="flex-1 border dark:border-[#444] rounded px-3 py-2 text-sm dark:bg-[#222] dark:text-white dark:placeholder:text-[#666]"
              />

              <button
                onClick={aplicarCupon}
                disabled={aplicandoCupon}
                className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 disabled:bg-orange-300"
              >
                {aplicandoCupon ? 'Aplicando...' : 'Aplicar'}
              </button>
            </div>

            {mensajeCupon && (
              <p
                className={`text-xs mt-2 ${
                  mensajeCupon.error
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {mensajeCupon.texto}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-400 dark:text-[#666]">
        Pago seguro: SSI, 256-bit · Encriptado
      </div>
    </div>
  );
}
