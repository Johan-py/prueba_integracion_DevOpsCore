'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'
import FiltrosEstadisticas from './components/FiltrosEstadisticas'
import DashboardResultados from './components/DashboardResultados'

const MapaSeleccionZona = dynamic(() => import('./components/MapaSeleccionZona'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 text-gray-500 animate-pulse">Cargando mapa…</div>
    </div>
  )
})

export type TipoOperacion = 'VENTA' | 'ALQUILER' | 'ANTICRETO'

export interface ZonaSeleccionada {
  id: number
  nombre: string
}

export interface EstadisticasData {
  zona: { id: number; nombre: string }
  tipoOperacion: string
  promedioPrecio: number
  totalPropiedades: number
  precioMinimo: number
  precioMaximo: number
  evolucionPrecios: { mes: string; promedio: number }[]
  distribucionPorCategoria: { categoria: string; cantidad: number; porcentaje: number }[]
}

// Usa rutas internas Next.js que proxean al backend local (sin CORS)

export default function EstadisticasZonaPage() {
  const router = useRouter()

  // ─── Estado principal ───────────────────────────────────────────────
  const [zonaSeleccionada, setZonaSeleccionada] = useState<ZonaSeleccionada | null>(null)
  const [tipoOperacion, setTipoOperacion] = useState<TipoOperacion>('VENTA')
  const [mostrarMapa, setMostrarMapa] = useState(false)

  // ─── Estado de resultados ────────────────────────────────────────────
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null)
  const [sinDatos, setSinDatos] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mostrandoResultados, setMostrandoResultados] = useState(false)

  // ─── Consultar estadísticas (CA 7) ───────────────────────────────────
  const consultarEstadisticas = useCallback(async () => {
    if (!zonaSeleccionada || !tipoOperacion) return

    setCargando(true)
    setError(null)
    setSinDatos(false)

    try {
      const res = await fetch(
        `/api/estadisticas-zona?zonaId=${zonaSeleccionada.id}&tipoOperacion=${tipoOperacion}`
      )
      const json = await res.json()

      if (json.sinDatos) {
        setSinDatos(true)
        setEstadisticas(null)
        setMostrandoResultados(true)
        return
      }

      if (!json.ok || !json.data) {
        setError(json.mensaje ?? 'Error al obtener estadísticas.')
        return
      }

      setEstadisticas(json.data)
      setMostrandoResultados(true)
    } catch {
      setError('Error de conexión. Verifica tu conexión e intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }, [zonaSeleccionada, tipoOperacion])

  // ─── Cambiar filtros (CA 11) ─────────────────────────────────────────
  const handleCambiarFiltros = () => {
    setMostrandoResultados(false)
    setEstadisticas(null)
    setSinDatos(false)
    setError(null)
  }

  // ─── Selección de zona desde mapa ────────────────────────────────────
  const handleSeleccionarZonaDesdemapa = (zona: ZonaSeleccionada) => {
    setZonaSeleccionada(zona)
    setMostrarMapa(false)
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      {/* Mapa modal */}
      {mostrarMapa && (
        <MapaSeleccionZona
          zonaActual={zonaSeleccionada}
          tipoOperacion={tipoOperacion}
          onSeleccionar={handleSeleccionarZonaDesdemapa}
          onCerrar={() => setMostrarMapa(false)}
          onTipoOperacionChange={setTipoOperacion}
          onVerEstadisticas={() => {
            setMostrarMapa(false)
            consultarEstadisticas()
          }}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back button */}
        <button
          onClick={() => (mostrandoResultados ? handleCambiarFiltros() : router.back())}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          id="btn-volver-estadisticas"
        >
          <ArrowLeft size={16} />
          {mostrandoResultados ? 'Volver' : 'Volver al inicio'}
        </button>

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Estadísticas de propiedades por zona
          </h1>
          <p className="text-gray-500 text-sm">
            Consulta el promedio de precios según ubicación y tipo de operación.
          </p>
        </div>

        {/* Vista: Filtros (CA 5 - se muestran antes de consultar) */}
        {!mostrandoResultados && (
          <FiltrosEstadisticas
            zonaSeleccionada={zonaSeleccionada}
            tipoOperacion={tipoOperacion}
            cargando={cargando}
            error={error}
            onZonaChange={setZonaSeleccionada}
            onTipoOperacionChange={setTipoOperacion}
            onConsultar={consultarEstadisticas}
            onAbrirMapa={() => setMostrarMapa(true)}
          />
        )}

        {/* Vista: Dashboard de resultados (CA 7, 8, 9, 10) */}
        {mostrandoResultados && (
          <DashboardResultados
            estadisticas={estadisticas}
            sinDatos={sinDatos}
            zona={zonaSeleccionada}
            tipoOperacion={tipoOperacion}
            onCambiarFiltros={handleCambiarFiltros}
          />
        )}
      </div>
    </main>
  )
}
