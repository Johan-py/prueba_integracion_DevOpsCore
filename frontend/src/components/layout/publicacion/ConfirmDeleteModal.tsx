interface ConfirmDeleteModalProps {
  abierto: boolean;
  onAceptar: () => void;
  onCancelar: () => void;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  abierto,
  onAceptar,
  onCancelar,
  loading = false,
}: ConfirmDeleteModalProps) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl mx-4">
        <div className="flex items-center justify-center bg-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800">
            Confirmar eliminación
          </h2>
        </div>

        <hr className="border-gray-200" />

        <div className="px-6 py-6">
          <p className="mb-1 text-base font-semibold text-gray-800">
            ¿Está seguro de eliminar esta publicación?
          </p>

          <p className="mb-8 text-sm text-gray-400">
            Esta acción no se puede deshacer
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancelar}
              disabled={loading}
              className="flex-1 rounded-full border-2 border-gray-300 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              onClick={onAceptar}
              disabled={loading}
              className="flex-1 rounded-full bg-orange-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Eliminando..." : "Aceptar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}