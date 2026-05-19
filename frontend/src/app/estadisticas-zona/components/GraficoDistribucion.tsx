'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Props {
  datos: { categoria: string; cantidad: number; porcentaje: number }[]
}

const COLORES = ['#E07B2A', '#3B82F6', '#22C55E', '#8B5CF6', '#EC4899', '#F59E0B']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TooltipCustom({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const { name, value, payload: p } = payload[0]
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-800">{name}</p>
      <p className="text-gray-500 text-xs">
        {value} propiedades · {p.porcentaje}%
      </p>
    </div>
  )
}

export default function GraficoDistribucion({ datos }: Props) {
  if (!datos || datos.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        No hay datos de distribución disponibles.
      </div>
    )
  }

  const dataConNombre = datos.map((d) => ({ ...d, name: d.categoria, value: d.cantidad }))

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {/* Donut */}
      <div className="flex-shrink-0">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={dataConNombre}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              dataKey="value"
              strokeWidth={2}
            >
              {dataConNombre.map((_, index) => (
                <Cell key={index} fill={COLORES[index % COLORES.length]} />
              ))}
            </Pie>
            <Tooltip content={<TooltipCustom />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda manual */}
      <ul className="flex flex-col gap-2 flex-1">
        {dataConNombre.map((item, index) => (
          <li key={item.categoria} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORES[index % COLORES.length] }}
              />
              <span className="text-gray-700">{item.categoria}</span>
            </span>
            <span className="font-semibold text-gray-800 ml-4">{item.porcentaje}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
