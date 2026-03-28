interface DeleteSuccessModalProps {
  abierto: boolean;
  onAceptar: () => void;
}

export default function DeleteSuccessModal({
  abierto,
  onAceptar,
}: DeleteSuccessModalProps) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl mx-4">
        <div className="bg-gray-100 px-6 py-5">
          <h2 className="text-center text-xl font-bold text-gray-800">
            Publicación eliminada
          </h2>
        </div>

        <hr className="border-gray-200" />

        <div className="flex flex-col items-center gap-5 px-6 py-6">
          <p className="text-center text-sm text-gray-800">
            La publicación fue eliminada exitosamente
          </p>

          <button
            onClick={onAceptar}
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}