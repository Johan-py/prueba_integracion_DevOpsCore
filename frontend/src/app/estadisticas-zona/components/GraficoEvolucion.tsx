'use client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface Props {
  datos: { mes: string; promedio: number }[]
}

function formatearMiles(valor: number): string {
  if (valor >= 1000) return `${(valor / 1000).toFixed(0)}K`
  return String(valor)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TooltipCustom({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="font-bold text-gray-900">
        USD {payload[0].value.toLocaleString('es-BO')}
      </p>
    </div>
  )
}

export default function GraficoEvolucion({ datos }: Props) {
  if (!datos || datos.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        No hay datos históricos disponibles.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={datos} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatearMiles}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<TooltipCustom />} />
        <Line
          type="monotone"
          dataKey="promedio"
          stroke="#E07B2A"
          strokeWidth={2}
          dot={{ fill: '#E07B2A', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#E07B2A' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
