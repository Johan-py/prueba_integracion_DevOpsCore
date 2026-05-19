'use client'
import dynamic from 'next/dynamic'
import { MapPin, SlidersHorizontal, AlertCircle } from 'lucide-react'
import type { EstadisticasData, TipoOperacion, ZonaSeleccionada } from '../page'

// Carga dinámica para evitar SSR con Recharts
const GraficoEvolucion = dynamic(() => import('./GraficoEvolucion'), { ssr: false })
const GraficoDistribucion = dynamic(() => import('./GraficoDistribucion'), { ssr: false })

interface Props {
  estadisticas: EstadisticasData | null
  sinDatos: boolean
  zona: ZonaSeleccionada | null
  tipoOperacion: TipoOperacion
  onCambiarFiltros: () => void
}

const TIPO_LABELS: Record<TipoOperacion, string> = {
  VENTA: 'Venta',
  ALQUILER: 'Alquiler',
  ANTICRETO: 'Anticrético'
}

function formatUSD(valor: number): string {
  return `USD ${valor.toLocaleString('es-BO')}`
}

interface MetricaCardProps {
  titulo: string
  valor: string
  subtitulo: string
}

function MetricaCard({ titulo, valor, subtitulo }: MetricaCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-gray-500 mb-2">{titulo}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">{valor}</p>
      <p className="text-xs text-gray-400">{subtitulo}</p>
    </div>
  )
}

export default function DashboardResultados({
  estadisticas,
  sinDatos,
  zona,
  tipoOperacion,
  onCambiarFiltros
}: Props) {
  // CA 4: Sin datos suficientes
  if (sinDatos) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
          <AlertCircle size={32} className="text-amber-500" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-1">No hay datos suficientes</p>
          <p className="text-sm text-gray-500 max-w-sm">
            No se encontraron propiedades en la zona <strong>{zona?.nombre}</strong> con tipo de
            operación <strong>{TIPO_LABELS[tipoOperacion]}</strong> para calcular estadísticas.
          </p>
        </div>
        <button
          id="btn-cambiar-filtros-sin-datos"
          onClick={onCambiarFiltros}
          className="mt-2 py-2 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#E07B2A] hover:text-[#E07B2A] transition-colors"
        >
          Cambiar filtros
        </button>
      </div>
    )
  }

  if (!estadisticas) return null

  return (
    <div className="flex flex-col gap-5">
      {/* Barra de contexto (CA 11 - Cambiar filtros) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Zona seleccionada</p>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-[#E07B2A]" />
              <span className="text-sm font-semibold text-gray-800">{estadisticas.zona.nombre}</span>
            </div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-gray-100" />
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Tipo de operación</p>
            <p className="text-sm font-semibold text-[#E07B2A]">{TIPO_LABELS[tipoOperacion]}</p>
          </div>
        </div>
        <button
          id="btn-cambiar-filtros"
          onClick={onCambiarFiltros}
          className="flex items-center gap-2 py-2 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#E07B2A] hover:text-[#E07B2A] transition-colors"
        >
          <SlidersHorizontal size={15} />
          Cambiar filtros
        </button>
      </div>

      {/* CA 8: Métricas principales (Promedio, total, mínimo, máximo) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricaCard
          titulo="Promedio de precio"
          valor={formatUSD(estadisticas.promedioPrecio)}
          subtitulo="Precio promedio"
        />
        <MetricaCard
          titulo="Propiedades analizadas"
          valor={String(estadisticas.totalPropiedades)}
          subtitulo="Propiedades"
        />
        <MetricaCard
          titulo="Precio mínimo"
          valor={formatUSD(estadisticas.precioMinimo)}
          subtitulo="En la zona"
        />
        <MetricaCard
          titulo="Precio máximo"
          valor={formatUSD(estadisticas.precioMaximo)}
          subtitulo="En la zona"
        />
      </div>

      {/* CA 9 y CA 10: Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CA 9: Evolución histórica del precio */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Evolución del precio promedio (USD)
          </h3>
          <GraficoEvolucion datos={estadisticas.evolucionPrecios} />
        </div>

        {/* CA 10: Distribución por tipo de inmueble */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Distribución por tipo de inmueble
          </h3>
          <GraficoDistribucion datos={estadisticas.distribucionPorCategoria} />
        </div>
      </div>
    </div>
  )
}
