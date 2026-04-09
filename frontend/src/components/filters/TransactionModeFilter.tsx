'use client'

interface TransactionModeFilterProps {
  modoSeleccionado: string[]
  onModoChange: (modo: string[]) => void
}

export default function TransactionModeFilter({
  modoSeleccionado,
  onModoChange
}: TransactionModeFilterProps) {
  const modos = [
    { id: 'VENTA', label: 'Venta' },
    { id: 'ALQUILER', label: 'Alquiler' },
    { id: 'ANTICRETO', label: 'Anticrético' }
  ]

  const handleToggle = (id: string) => {
    const nuevos = modoSeleccionado.includes(id)
      ? modoSeleccionado.filter((m) => m !== id)
      : [...modoSeleccionado, id]
    onModoChange(nuevos)
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex flex-nowrap gap-6 min-w-max px-1">
        {modos.map((modo) => (
          <label
            key={modo.id}
            className="flex items-center gap-2 text-sm text-stone-900 font-medium cursor-pointer shrink-0 whitespace-nowrap"
          >
            <div className="relative inline-flex shadow-xl">
              <input
                type="checkbox"
                name="modoTransaccion"
                value={modo.id}
                checked={modoSeleccionado.includes(modo.id)}
                onChange={() => handleToggle(modo.id)}
                className={`
                  w-[35px] h-[23px] rounded border cursor-pointer appearance-none
                  ${
                    modoSeleccionado.includes(modo.id)
                      ? 'bg-[#d97706] border-[#d97706]'
                      : 'bg-white border-gray-400'
                  }
                `}
              />
              {modoSeleccionado.includes(modo.id) && (
                <svg
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[14px] h-[14px] pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="3"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                >
                  <polyline points="4 12 10 18 20 6" />
                </svg>
              )}
            </div>
            {modo.label}
          </label>
        ))}
      </div>
    </div>
  )
}
