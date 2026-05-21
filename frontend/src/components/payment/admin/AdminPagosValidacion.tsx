'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, CreditCard, AlertTriangle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

type EstadoPago = 'PENDIENTE' | 'COMPLETADO' | 'RECHAZADO' | 'CANCELADO'

interface TransaccionAdmin {
  id: number
  usuario: string
  correo: string
  referencia: string
  monto: number
  fecha: string
  estado: EstadoPago
  plan: string | null
}

const FILTROS: Array<{ label: string; value: EstadoPago | 'TODOS' }> = [
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'Aprobados', value: 'COMPLETADO' },
  { label: 'Rechazados', value: 'RECHAZADO' },
  { label: 'Todos', value: 'TODOS' },
]

function formatDate(fecha: string) {
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(fecha))
}

function EstadoBadge({ estado }: { estado: EstadoPago }) {
  if (estado === 'COMPLETADO') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Aprobado
      </span>
    )
  }
  if (estado === 'RECHAZADO') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Rechazado
      </span>
    )
  }
  if (estado === 'CANCELADO') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-500">
        <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
        Cancelado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Pendiente
    </span>
  )
}

export default function AdminPagosValidacion() {
  const [transacciones, setTransacciones] = useState<TransaccionAdmin[]>([])
  const [filtro, setFiltro] = useState<EstadoPago | 'TODOS'>('PENDIENTE')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [procesando, setProcesando] = useState<number | null>(null)
  const [rechazarId, setRechazarId] = useState<number | null>(null)
  const [motivo, setMotivo] = useState('')
  const [motivoError, setMotivoError] = useState('')

  const cargarTransacciones = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/transacciones/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('No se pudo cargar la lista de transacciones')
      const data = await res.json()
      setTransacciones(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar transacciones')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarTransacciones()
    const interval = setInterval(cargarTransacciones, 20000)
    return () => clearInterval(interval)
  }, [])

  const confirmarPago = async (id: number) => {
    setProcesando(id)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/transacciones/${id}/confirmar`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Error al confirmar')
      }
      await cargarTransacciones()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al confirmar el pago')
    } finally {
      setProcesando(null)
    }
  }

  const abrirModalRechazo = (id: number) => {
    setRechazarId(id)
    setMotivo('')
    setMotivoError('')
  }

  const cerrarModalRechazo = () => {
    setRechazarId(null)
    setMotivo('')
    setMotivoError('')
  }

  const confirmarRechazo = async () => {
    if (!motivo.trim()) {
      setMotivoError('El motivo es obligatorio')
      return
    }
    if (!rechazarId) return
    setProcesando(rechazarId)
    cerrarModalRechazo()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/transacciones/${rechazarId}/rechazar`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motivo: motivo.trim() }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Error al rechazar')
      }
      await cargarTransacciones()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al rechazar el pago')
    } finally {
      setProcesando(null)
    }
  }

  const lista =
    filtro === 'TODOS' ? transacciones : transacciones.filter((t) => t.estado === filtro)

  const pendienteCount = transacciones.filter((t) => t.estado === 'PENDIENTE').length

  return (
    <>
      {/* Rejection reason modal */}
      {rechazarId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 shrink-0" />
              <h2 className="text-lg font-bold font-montserrat text-stone-900">Rechazar pago</h2>
            </div>
            <p className="text-sm text-stone-500">
              Indica el motivo del rechazo. El usuario recibirá esta información por notificación.
            </p>
            <div>
              <textarea
                value={motivo}
                onChange={(e) => { setMotivo(e.target.value); setMotivoError('') }}
                rows={3}
                placeholder="Ej: El comprobante adjunto no coincide con el monto indicado."
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-red-400 resize-none"
              />
              {motivoError && <p className="mt-1 text-xs text-red-500">{motivoError}</p>}
            </div>
            <div className="flex gap-3">
              <button
                onClick={cerrarModalRechazo}
                className="flex-1 rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarRechazo}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Rechazar pago
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-stone-50 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="space-y-8 animate-fade">
            <section>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold font-montserrat text-stone-900">
                    Validación de Pagos
                  </h1>
                  <p className="text-sm text-stone-500 font-inter">
                    Confirma o rechaza los pagos QR pendientes de los usuarios
                  </p>
                </div>
              </div>
            </section>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              {FILTROS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFiltro(f.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold font-inter transition-colors ${
                    filtro === f.value
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-600 hover:text-amber-600'
                  }`}
                >
                  {f.label}
                  {f.value === 'PENDIENTE' && pendienteCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-white/25 px-1.5 py-0.5 text-xs">
                      {pendienteCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tabla */}
            <div className="rounded-2xl border border-stone-100 bg-white shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
                </div>
              ) : error ? (
                <div className="py-14 text-center">
                  <p className="text-stone-500 font-inter">{error}</p>
                  <button
                    onClick={cargarTransacciones}
                    className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                  >
                    Reintentar
                  </button>
                </div>
              ) : lista.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-stone-300 m-4 px-6 py-14 text-center text-stone-500">
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 font-inter">
                    Sin registros
                  </p>
                  <p className="mt-3 text-base font-inter">
                    {filtro === 'PENDIENTE'
                      ? 'No hay pagos pendientes por validar.'
                      : filtro === 'COMPLETADO'
                        ? 'Aún no hay pagos aprobados.'
                        : filtro === 'RECHAZADO'
                          ? 'Aún no hay pagos rechazados.'
                          : 'No hay transacciones registradas.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-inter">
                    <thead>
                      <tr className="border-b border-stone-100 bg-stone-50">
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                          Usuario
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                          Ref. Pago
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                          Plan
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-stone-400">
                          Monto
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                          Fecha
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                          Estado
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lista.map((t) => (
                        <tr
                          key={t.id}
                          className="border-t border-stone-100 hover:bg-stone-50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-stone-900">{t.usuario}</p>
                            <p className="text-xs text-stone-400">{t.correo}</p>
                          </td>
                          <td className="px-5 py-4 font-mono text-stone-600">{t.referencia}</td>
                          <td className="px-5 py-4 text-stone-600">{t.plan ?? '—'}</td>
                          <td className="px-5 py-4 text-right font-semibold text-stone-900">
                            Bs. {t.monto.toFixed(2)}
                          </td>
                          <td className="px-5 py-4 text-stone-500">
                            {t.fecha ? formatDate(t.fecha) : '—'}
                          </td>
                          <td className="px-5 py-4">
                            <EstadoBadge estado={t.estado} />
                          </td>
                          <td className="px-5 py-4">
                            {t.estado === 'PENDIENTE' ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => confirmarPago(t.id)}
                                  disabled={procesando === t.id}
                                  className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => abrirModalRechazo(t.id)}
                                  disabled={procesando === t.id}
                                  className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Rechazar
                                </button>
                              </div>
                            ) : t.estado === 'COMPLETADO' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700">
                                <CheckCircle className="h-4 w-4" />
                                Aceptado
                              </span>
                            ) : t.estado === 'RECHAZADO' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                                <XCircle className="h-4 w-4" />
                                Rechazado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400">
                                <Clock className="h-4 w-4" />
                                Cancelado
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
