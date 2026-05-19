'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CreditCard, Calendar, BarChart2, Zap, CheckCircle, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

interface Suscripcion {
  activa: boolean
  expirado?: boolean
  idSuscripcion: number | null
  planNombre: string | null
  precioPlan: number | null
  fechaInicio: string | null
  fechaFin: string | null
}

interface Consumo {
  usadas: number
  limite: number
  plan: string
}

function diasRestantes(fechaFin: string): number {
  return Math.max(0, Math.ceil((new Date(fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

export default function MiPlanPage() {
  const [sus, setSus] = useState<Suscripcion | null>(null)
  const [consumo, setConsumo] = useState<Consumo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }

    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(`${API_URL}/api/suscripciones/mi-suscripcion`, { headers }).then((r) => r.json()),
      fetch(`${API_URL}/api/consumo/me`, { headers }).then((r) => r.json()),
    ])
      .then(([s, c]) => {
        setSus(s)
        setConsumo(c)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
      </div>
    )
  }

  const activa = sus?.activa ?? false
  const expirado = sus?.expirado ?? false
  const dias = sus?.fechaFin ? diasRestantes(sus.fechaFin) : 0
  const porcentajeUso = consumo && consumo.limite > 0
    ? Math.min(100, Math.round((consumo.usadas / consumo.limite) * 100))
    : 0

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="container mx-auto px-4 max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <CreditCard className="h-7 w-7 text-amber-600" />
          <h1 className="text-2xl font-bold font-montserrat text-stone-900">
            Mi Plan <span className="text-amber-600">Actual</span>
          </h1>
        </div>

        {activa || expirado ? (
          <>
            {/* Plan card */}
            <div className={`rounded-2xl border p-6 shadow-sm ${expirado ? 'border-stone-200 bg-stone-50' : 'border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {expirado ? (
                      <>
                        <AlertCircle className="h-5 w-5 text-stone-400" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">Expirado</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-green-600">Activa</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold font-montserrat text-stone-900">{sus?.planNombre}</h2>
                  {sus?.precioPlan != null && (
                    <p className="text-sm text-stone-500 mt-0.5">
                      Bs. {sus.precioPlan.toFixed(2)} / mes
                    </p>
                  )}
                </div>
                <Zap className={`h-8 w-8 ${expirado ? 'text-stone-300' : 'text-amber-500'}`} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/70 p-3">
                  <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-0.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Inicio</span>
                  </div>
                  <p className="text-sm font-semibold text-stone-800">
                    {formatDate(sus?.fechaInicio ?? null)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/70 p-3">
                  <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-0.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Vencimiento</span>
                  </div>
                  <p className="text-sm font-semibold text-stone-800">
                    {formatDate(sus?.fechaFin ?? null)}
                  </p>
                </div>
              </div>

              {!expirado && (
                <div className="mt-3 rounded-xl bg-white/70 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-stone-600">Días restantes</span>
                  <span className={`text-lg font-bold font-montserrat ${dias <= 7 ? 'text-red-600' : 'text-amber-600'}`}>
                    {dias} días
                  </span>
                </div>
              )}
            </div>

            {/* Usage */}
            {consumo && (
              <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-amber-600" />
                  <h3 className="text-base font-bold font-montserrat text-stone-900">Uso de publicaciones</h3>
                </div>
                <div className="flex items-end justify-between text-sm mb-1">
                  <span className="text-stone-500">Este mes</span>
                  <span className="font-semibold text-stone-800">
                    {consumo.usadas} / {consumo.limite}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${porcentajeUso >= 90 ? 'bg-red-500' : porcentajeUso >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${porcentajeUso}%` }}
                  />
                </div>
                <p className="text-xs text-stone-400">
                  {consumo.limite - consumo.usadas} publicaciones disponibles
                </p>
              </div>
            )}
          </>
        ) : (
          /* No subscription at all */
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-stone-300 mx-auto" />
            <h2 className="text-xl font-bold font-montserrat text-stone-900">Sin suscripción activa</h2>
            <p className="text-stone-500 text-sm max-w-xs mx-auto">
              Elige un plan para desbloquear más publicaciones y funciones exclusivas.
            </p>
            <Link
              href="/planes"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
            >
              Ver planes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/profile/historial-pagos"
            className="flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Historial de pagos
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          {activa && (
            <Link
              href="/planes"
              className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
            >
              Cambiar plan
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          {(activa || expirado) && (
            <Link
              href="/cobros-suscripciones"
              className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Renovar plan
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
