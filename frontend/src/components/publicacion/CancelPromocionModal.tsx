'use client'

interface CancelPromocionModalProps {
  abierto: boolean
  propiedadNombre: string
  onConfirmar: () => void
  onCancelar: () => void
  loading?: boolean
}

export default function CancelPromocionModal({
  abierto,
  propiedadNombre,
  onConfirmar,
  onCancelar,
  loading = false,
}: CancelPromocionModalProps) {
  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-[#F9F6EE] shadow-xl mx-4">
        <div className="px-6 pt-5 pb-2 text-center">
          <div className="text-5xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800">Cancelar publicidad</h2>
          <p className="text-sm text-gray-600 mt-1">
            ¿Estás seguro de cancelar la publicidad de <span className="font-semibold">"{propiedadNombre}"</span>?
          </p>
        </div>

        <hr className="h-[2px] bg-gray-800" />

        <div className="px-4 py-4">
          <p className="text-center text-sm text-gray-500 mb-4">
            La propiedad dejará de aparecer destacada en los resultados de búsqueda.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirmar}
              disabled={loading}
              className="w-full rounded-lg bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? 'Cancelando...' : 'Sí, cancelar publicidad'}
            </button>

            <button
              onClick={onCancelar}
              className="w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              No, mantener
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}