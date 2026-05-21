'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Copy, CheckCircle, Clock, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react'
import Stepper from '@/components/ui/Stepper'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

interface PagoUsdt {
  id: number
  walletAddress: string
  totalBob: number
  totalUsdt: number
  bob_per_usdt: number
  red: string
  token: string
  fechaExpiracion: string
  referencia: string
  planNombre: string
}

const fmt = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

function PagoUsdtContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const transaccionId = searchParams.get('transaccionId')

  const [pago, setPago] = useState<PagoUsdt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [txHash, setTxHash] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [resultadoVerif, setResultadoVerif] = useState<{ ok: boolean; msg: string } | null>(null)

  const [copied, setCopied] = useState<'wallet' | 'amount' | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const expiredRef = useRef(false)

  const [showCancelModal, setShowCancelModal] = useState(false)

  // Cargar datos del pago desde localStorage
  useEffect(() => {
    if (!transaccionId) {
      setError('Falta el ID de transacción')
      setLoading(false)
      return
    }

    const stored = localStorage.getItem('usdtPayment')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PagoUsdt
        if (String(parsed.id) === transaccionId) {
          setPago(parsed)
          setLoading(false)
          return
        }
      } catch { /* ignore */ }
    }

    // Si no hay datos en localStorage, intentar obtenerlos del backend
    const token = localStorage.getItem('token') ?? ''
    fetch(`${API_URL}/api/transacciones/${transaccionId}/estado`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.estado === 'completado') {
          router.replace('/pago/confirmacion')
        } else {
          setError('No se encontraron datos del pago. Vuelve al resumen.')
        }
      })
      .catch(() => setError('Error al cargar el pago'))
      .finally(() => setLoading(false))
  }, [transaccionId, router])

  // Timer de cuenta regresiva
  useEffect(() => {
    if (!pago) return
    const segundosRestantes = Math.floor(
      (new Date(pago.fechaExpiracion).getTime() - Date.now()) / 1000
    )
    setTimeLeft(Math.max(0, segundosRestantes))
  }, [pago])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft])

  // Auto-cancelar cuando el tiempo llega a 0
  useEffect(() => {
    if (timeLeft !== 0 || expiredRef.current || !pago) return
    expiredRef.current = true
    const token = localStorage.getItem('token') ?? ''
    fetch(`${API_URL}/api/transacciones/${pago.id}/cancelar`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
  }, [timeLeft, pago])

  const copiar = async (texto: string, tipo: 'wallet' | 'amount') => {
    await navigator.clipboard.writeText(texto)
    setCopied(tipo)
    setTimeout(() => setCopied(null), 2000)
  }

  const verificar = async () => {
    if (!txHash.trim() || !pago) return
    setVerificando(true)
    setResultadoVerif(null)

    try {
      const token = localStorage.getItem('token') ?? ''
      const res = await fetch(`${API_URL}/api/usdt/${pago.id}/verificar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ txHash: txHash.trim() }),
      })
      const data = await res.json()

      if (res.ok && data.ok) {
        setResultadoVerif({ ok: true, msg: data.mensaje })
        localStorage.removeItem('usdtPayment')
        setTimeout(() => router.push('/pago/confirmacion'), 2000)
      } else {
        setResultadoVerif({ ok: false, msg: data.error ?? data.mensaje ?? 'Verificación fallida' })
      }
    } catch {
      setResultadoVerif({ ok: false, msg: 'Error de conexión al verificar' })
    } finally {
      setVerificando(false)
    }
  }

  const cancelarPago = async () => {
    if (!pago) return
    const token = localStorage.getItem('token') ?? ''
    await fetch(`${API_URL}/api/transacciones/${pago.id}/cancelar`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
    localStorage.removeItem('usdtPayment')
    router.push('/pago/resumen?planId=' + (pago.id))
  }

  const isExpired = timeLeft === 0
  const isUrgent = timeLeft !== null && timeLeft < 120 && !isExpired

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
      </div>
    )
  }

  if (error || !pago) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-medium">{error ?? 'Pago no disponible'}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-orange-600 underline text-sm"
        >
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <Stepper />
        <span className="text-gray-500 text-sm">PropBol Inmobiliaria</span>
      </div>

      {/* Aviso testnet */}
      <div className="flex items-center gap-2 mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-700">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        Integración operando sobre <strong className="ml-1">Testnet Shasta</strong> (no mainnet).
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel izquierdo */}
        <div className="space-y-4">

          {/* Monto */}
          <div className="border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Monto exacto a enviar</p>
            <p className="text-4xl font-extrabold text-gray-900">
              {pago.totalUsdt.toFixed(6)} <span className="text-2xl text-blue-600">USDT</span>
            </p>
            <p className="text-sm text-gray-400 mt-1">
              ≈ Bs. {pago.totalBob.toFixed(2)} · Plan {pago.planNombre}
            </p>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center justify-between rounded-xl px-5 py-3 border ${
              isExpired
                ? 'bg-red-50 border-red-300'
                : isUrgent
                ? 'bg-orange-50 border-orange-300'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock
                className={`w-5 h-5 ${isExpired ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-gray-500'}`}
              />
              <span className="text-sm text-gray-600">Tiempo disponible</span>
            </div>
            <span
              className={`text-xl font-bold tabular-nums ${
                isExpired ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-gray-800'
              }`}
            >
              {isExpired ? 'Expirado' : fmt(timeLeft ?? 0)}
            </span>
          </div>

          {/* Dirección wallet */}
          <div className="border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Dirección de Pago TRC20</p>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {pago.red}
              </span>
            </div>
            <p className="text-sm text-amber-600 font-medium mb-3">
              ⚠ Envía exactamente <strong>{pago.totalUsdt.toFixed(6)} USDT</strong> a la dirección indicada.
            </p>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <span className="text-xs font-mono text-gray-700 flex-1 break-all">
                {pago.walletAddress}
              </span>
              <button
                onClick={() => copiar(pago.walletAddress, 'wallet')}
                className="shrink-0 text-gray-400 hover:text-orange-500 transition"
                title="Copiar dirección"
              >
                {copied === 'wallet' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <button
              onClick={() => copiar(pago.totalUsdt.toFixed(6), 'amount')}
              className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition"
            >
              {copied === 'amount' ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              Copiar monto
            </button>
          </div>

          {/* Tipo de cambio */}
          <p className="text-xs text-gray-400 text-center">
            1 USDT = Bs. {pago.bob_per_usdt.toFixed(3)} · {pago.referencia}
          </p>

          {/* Verificación */}
          <div className="border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
            <p className="text-sm font-semibold text-gray-700">Hash de transacción (TX ID)</p>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Ej: a1b2c3d4e5f6..."
              disabled={isExpired || !!resultadoVerif?.ok}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-100"
            />
            <button
              onClick={verificar}
              disabled={!txHash.trim() || verificando || isExpired || !!resultadoVerif?.ok}
              className="w-full py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {verificando && <Loader2 className="w-4 h-4 animate-spin" />}
              {verificando ? 'Verificando...' : 'Ya realicé la transferencia →'}
            </button>

            {resultadoVerif && (
              <div
                className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
                  resultadoVerif.ok
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {resultadoVerif.ok ? (
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                {resultadoVerif.msg}
              </div>
            )}
          </div>

          {/* Botón volver */}
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver / Cancelar pago
          </button>
        </div>

        {/* Panel derecho */}
        <div className="space-y-4">

          {/* Resumen del pago */}
          <div className="border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-3">Resumen del pago</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Plan {pago.planNombre}</span>
                <span>Bs. {(pago.totalBob / 1.13).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">IVA (13%)</span>
                <span>Bs. {(pago.totalBob - pago.totalBob / 1.13).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-blue-600">
                <span>Conversión USDT</span>
                <span>1 USDT = Bs. {pago.bob_per_usdt.toFixed(3)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total USDT</span>
                <span className="text-blue-700">{pago.totalUsdt.toFixed(6)} USDT</span>
              </div>
            </div>
          </div>

          {/* Estado de verificación on-chain */}
          <div className="border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-4">Estado de Verificación On-Chain</p>
            <div className="space-y-3">
              {[
                { label: 'Dirección generada', done: true },
                { label: 'Monto con cambio vigente', done: true },
                {
                  label: 'Esperando confirmación on-chain',
                  done: resultadoVerif?.ok ?? false,
                  pending: !resultadoVerif,
                },
                { label: 'Activar suscripción', done: resultadoVerif?.ok ?? false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  {step.done ? (
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  ) : step.pending ? (
                    <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                  )}
                  <span className={`text-sm ${step.done ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {resultadoVerif?.ok && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Pago Confirmado On-Chain · Verificado
              </div>
            )}
          </div>

          {/* Info QR estático */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 space-y-2">
            <p><strong>QR Estático — Uso único</strong><br />Este código permanece estático mientras la transacción esté pendiente.</p>
            <p><strong>Actualización automática</strong><br />Cuando el sistema detecte que el pago se completó, la pantalla se actualizará sin que tengas que refrescarla.</p>
            {isExpired && (
              <p className="text-red-600 font-medium">
                <strong>Tiempo agotado</strong> — La transacción fue cancelada automáticamente. Elige otro método.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">¿Cancelar pago en curso?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Si cancelas perderás esta orden y deberás generar una nueva.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelarPago}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
              >
                Sí, cancelar
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PagoUsdtPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
      </div>
    }>
      <PagoUsdtContent />
    </Suspense>
  )
}
