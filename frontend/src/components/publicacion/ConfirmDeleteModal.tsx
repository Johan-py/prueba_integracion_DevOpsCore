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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-[#F9F6EE] shadow-xl mx-4">
        <div className="flex items-center justify-center bg-[#F9F6EE] px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800 text-center">
            Confirmar eliminación
          </h2>
        </div>

        <hr className="h-[2px] bg-gray-800" />

        <div className="px-3 py-3 text-center">
          <p className="mb-1 text-base font-semibold text-gray-800 ">
            ¿Está seguro de eliminar esta publicación?
          </p>

          <p className="mb-8 text-sm text-gray-500 ">
            Esta acción no se puede deshacer
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={onCancelar}
              disabled={loading}
              className="h-11 w-full rounded-lg border border-[#9a9a9a] bg-white text-[14px] font-medium text-[#2c2c2c] transition hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              onClick={onAceptar}
              disabled={loading}
              className="h-11 w-full rounded-lg bg-[#D97706] text-[14px] font-medium text-white transition hover:bg-[#bf6905]"
            >
              {loading ? "Eliminando..." : "Aceptar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
