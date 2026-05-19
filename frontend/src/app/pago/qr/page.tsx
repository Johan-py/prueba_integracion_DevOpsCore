'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, Upload, X, FileText } from 'lucide-react'
import Stepper from '@/components/ui/Stepper'
import { useCurrentPayment } from '@/hooks/payment/useCurrentPayment'
import { usePaymentStatus } from '@/hooks/payment/usePaymentStatus'
import { useCancelPayment } from '@/hooks/payment/useCancelPayment'
import { QRDisplay } from '@/components/payment/QRDisplay'
import { ExpiredView } from '@/components/payment/ExpiredView'
import { CancelPaymentModal } from '@/components/payment/CancelPaymentModal'

const BANKS = ['BNB', 'Banco Unión', 'Económica', 'Fassil']
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']

export default function PagoQRPage() {
  const router = useRouter()
  const { payment, loading, error } = useCurrentPayment()
  const { isModalOpen, openModal, closeModal, confirmCancel } = useCancelPayment(payment)
  const { status } = usePaymentStatus(payment?.id ?? null)

  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const expiredHandled = useRef(false)
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null)
  const [comprobantePreview, setComprobantePreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!payment) return
    const remaining = payment.fechaExpiracion
      ? Math.max(0, Math.floor((new Date(payment.fechaExpiracion).getTime() - Date.now()) / 1000))
      : 600
    setTimeLeft(remaining)
  }, [payment])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || status === 'pagado') return
    const id = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [timeLeft, status])

  useEffect(() => {
    if (timeLeft !== 0 || expiredHandled.current || !payment) return
    expiredHandled.current = true
    setIsExpired(true)
    fetch(`/api/transacciones/${payment.id}/cancelar`, { method: 'PATCH' }).catch(() => {})
    localStorage.removeItem('currentPayment')
  }, [timeLeft, payment])

  useEffect(() => {
    if (status === 'pagado') router.push('/pago/confirmacion')
  }, [status, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setFileError(null)
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Formato no válido. Solo JPG, PNG o PDF.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('El archivo supera el límite de 5 MB.')
      return
    }
    setComprobanteFile(file)
    if (file.type.startsWith('image/')) {
      setComprobantePreview(URL.createObjectURL(file))
    } else {
      setComprobantePreview(null)
    }
  }

  const handleRemoveFile = () => {
    setComprobanteFile(null)
    setComprobantePreview(null)
    setFileError(null)
  }

  const handleConfirmarPago = async () => {
    if (!payment) return

    if (comprobanteFile) {
      try {
        setUploading(true)
        const token = localStorage.getItem('token')
        const formData = new FormData()
        formData.append('comprobante', comprobanteFile)
        await fetch(`${API_URL}/api/transacciones/${payment.id}/comprobante`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        })
      } catch { /* non-blocking — proceed anyway */ } finally {
        setUploading(false)
      }
    }

    localStorage.setItem('currentPayment', JSON.stringify(payment))
    router.push('/pago/pendiente')
  }

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const isUrgent = timeLeft !== null && timeLeft < 60

  const qrImageSrc = (() => {
    if (!payment?.planNombre || !payment?.tipoFacturacion) return undefined
    const plan = payment.planNombre.toLowerCase().includes('pro') ? 'pro' : 'estandar'
    const billing = payment.tipoFacturacion === 'anual' ? 'anual' : 'mensual'
    return `/qrs/${plan}-${billing}.png`
  })()

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-sans text-stone-500">
        Cargando pago...
      </div>
    )

  if (error || !payment)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans p-4">
        <p className="text-red-500 mb-4 font-bold">⚠️ No se encontró la transacción</p>
        <p className="text-stone-500 text-sm mb-6 text-center">
          Selecciona un plan para iniciar el proceso de pago.
        </p>
        <a href="/cobros-suscripciones" className="bg-stone-800 text-white px-6 py-2 rounded-lg font-medium">
          Ver planes
        </a>
      </div>
    )

  if (isExpired) return <ExpiredView planId={payment?.planId} />

  return (
    <>
      <CancelPaymentModal isOpen={isModalOpen} onConfirm={confirmCancel} onCancel={closeModal} />

      <main
        className={`min-h-screen font-sans pb-16 transition-colors duration-500 ${
          isUrgent ? 'bg-red-50' : 'bg-stone-50'
        }`}
      >
        {/* Top bar — Stepper */}
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <Stepper onBackClick={openModal} />
            <span className="text-sm text-stone-400 hidden sm:block">PropBol Inmobiliaria</span>
          </div>
        </div>

        {/* Breadcrumb / back */}
        <div className="max-w-6xl mx-auto px-6 pt-4 pb-2">
          <button
            onClick={openModal}
            className="flex items-center gap-1.5 text-stone-500 hover:text-stone-800 text-sm transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Checkout · Pago por QR</span>
          </button>
        </div>

        {/* Two-column content */}
        <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row gap-6 mt-2">

          {/* ──── LEFT: main QR area ──── */}
          <div className="flex-1 min-w-0">
            {/* Amount */}
            <div className="text-center mb-6">
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Monto a pagar</p>
              <p className={`text-6xl font-bold leading-none ${isUrgent ? 'text-red-700' : 'text-stone-900'}`}>
                Bs.&nbsp;{Number(payment.monto).toFixed(2)}
              </p>
              <p className="text-sm text-stone-400 mt-2">
                {payment.planNombre ?? 'Plan'} · IVA incluido · Válido hasta pago
              </p>
            </div>

            {/* Timer bar */}
            <div
              className={`flex items-center justify-between px-5 py-3 rounded-xl mb-5 transition-colors ${
                isUrgent ? 'bg-red-100 border border-red-200' : 'bg-amber-50 border border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={16} className={isUrgent ? 'text-red-600' : 'text-stone-400'} />
                <span className={`text-sm ${isUrgent ? 'text-red-700' : 'text-stone-600'}`}>
                  Tiempo disponible para completar el pago
                </span>
              </div>
              <span
                className={`text-2xl font-mono font-bold tabular-nums ${
                  isUrgent ? 'text-red-700' : 'text-amber-600'
                }`}
              >
                {fmt(timeLeft ?? 0)}
              </span>
            </div>

            {/* QR card */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 flex flex-col items-center">
              <QRDisplay
                value={payment.qrContent || 'PROBOL_TEST_TOKEN'}
                imageSrc={qrImageSrc}
                size={250}
              />

              <p className="text-xs text-stone-400 mt-3 text-center">
                250×250 px renderizado · Mínimo requerido 200×200 px · Optimizado para cualquier cámara de celular
              </p>

              <p className="text-sm font-mono font-bold text-stone-800 mt-4">
                #{payment.referencia}
              </p>
              <p className="text-sm text-stone-500 mt-1">
                Escanea este código desde tu aplicación bancaria boliviana
              </p>

              {/* Bank logos */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {BANKS.map(b => (
                  <span
                    key={b}
                    className="text-xs text-stone-400 border border-stone-200 px-3 py-1 rounded-full"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ──── RIGHT: sidebar ──── */}
          <div className="w-full lg:w-80 space-y-4 shrink-0">

            {/* Resumen del pago */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h3 className="font-semibold text-stone-800 mb-4">Resumen del pago</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-700">
                  <span>
                    {payment.planNombre ?? 'Plan'}
                    {payment.tipoFacturacion === 'anual' && (
                      <span className="ml-1.5 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Anual</span>
                    )}
                  </span>
                  <span>Bs. {Number(payment.subtotal ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>IVA (13%)</span>
                  <span>Bs. {Number(payment.iva_monto ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-amber-600 pt-2 border-t border-stone-100">
                  <span>Total</span>
                  <span>Bs. {Number(payment.monto).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* QR Estático — Uso único */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">●</span>
                <div>
                  <p className="text-sm font-semibold text-stone-800">QR Estático — Uso único</p>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    Este código permanece estático mientras la transacción esté pendiente. Si abandonas esta página, el mismo QR te esperará al volver.
                  </p>
                </div>
              </div>
            </div>

            {/* Actualización automática */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">●</span>
                <div>
                  <p className="text-sm font-semibold text-stone-800">Actualización automática</p>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    Cuando el servidor detecte que el pago se completó, la pantalla se actualizará automáticamente a &ldquo;Pago Exitoso&rdquo; sin que el usuario refresque manualmente.
                  </p>
                </div>
              </div>
            </div>

            {/* Estado: Tiempo agotado */}
            <div className="bg-red-50 rounded-2xl border border-red-200 p-4">
              <div className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">●</span>
                <div>
                  <p className="text-sm font-semibold text-red-700">Estado: Tiempo agotado (00:00)</p>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    El fondo cambia sutilmente a rojo tenue y el ícono de reloj se hace visible para enfatizar la urgencia. El sistema cancela automáticamente y redirige al selector de métodos de pago.
                  </p>
                  <p className="text-xs text-red-600 font-medium mt-1.5">
                    Tiempo agotado → Transacción cancelada. Elige otro método.
                  </p>
                </div>
              </div>
            </div>

            {/* Upload comprobante */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
                Adjuntar comprobante <span className="normal-case font-normal">(opcional)</span>
              </p>

              {!comprobanteFile ? (
                <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-200 hover:border-amber-400 hover:bg-amber-50 cursor-pointer p-6 transition-colors">
                  <Upload size={24} className="text-stone-400" />
                  <span className="text-sm font-medium text-stone-600">Haz clic para adjuntar</span>
                  <span className="text-xs text-stone-400">JPG, PNG o PDF · máx. 5 MB</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  {comprobantePreview ? (
                    <img
                      src={comprobantePreview}
                      alt="Vista previa"
                      className="w-full max-h-48 object-contain rounded-lg border border-stone-100"
                    />
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-stone-100 bg-stone-50 p-3">
                      <FileText size={24} className="text-red-500 shrink-0" />
                      <span className="text-sm text-stone-700 truncate">{comprobanteFile.name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 truncate max-w-[70%]">{comprobanteFile.name}</span>
                    <button
                      onClick={handleRemoveFile}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X size={12} /> Quitar
                    </button>
                  </div>
                </div>
              )}

              {fileError && (
                <p className="mt-2 text-xs text-red-500">{fileError}</p>
              )}
            </div>

            {/* Confirmar pago */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="text-sm font-semibold text-stone-800 mb-1">¿Ya realizaste el pago?</p>
              <p className="text-xs text-stone-500 mb-3 leading-relaxed">
                Después de escanear el QR y completar la transferencia en tu app bancaria, presiona el botón para confirmar tu pago.
              </p>
              <button
                onClick={handleConfirmarPago}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                <CheckCircle size={16} />
                {uploading ? 'Subiendo comprobante...' : 'Ya realicé el pago'}
              </button>
            </div>

            {/* Flecha "Atrás" → Confirmación */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="text-sm font-semibold text-stone-800 mb-1">
                Flecha &ldquo;Atrás&rdquo; → Confirmación
              </p>
              <p className="text-xs text-stone-500 mb-3 leading-relaxed">
                Al presionar la flecha de retroceso aparece un mensaje de confirmación preguntando si desea cancelar la intención de pago actual antes de salir.
              </p>
              <p className="text-sm font-semibold text-stone-800 text-center mb-2">
                ¿Cancelar pago en curso?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={confirmCancel}
                  className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Sí, cancelar
                </button>
                <button
                  className="flex-1 text-xs border border-stone-200 hover:bg-stone-50 text-stone-700 py-2 rounded-lg font-semibold transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
