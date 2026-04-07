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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-[#F9F6EE] shadow-xl ">
        <div className="bg-[#F9F6EE] px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-800 text-center">
            Publicación eliminada
          </h2>
        </div>

        <hr className="h-[2px] bg-gray-800" />

        <div className="flex flex-col items-center gap-5 px-3 py-3 font-semibold ">
          <p className="text-center text-sm text-gray-800">
            La publicación fue eliminada exitosamente
          </p>

          <button
            onClick={onAceptar}
            className="rounded-lg bg-[#D97706] px-10 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#bf6905]"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
