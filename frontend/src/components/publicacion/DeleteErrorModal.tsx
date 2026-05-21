interface DeleteErrorModalProps {
  abierto: boolean
  mensaje?: string
  onAceptar: () => void
}

export default function DeleteErrorModal({
  abierto,
  onAceptar
}: DeleteErrorModalProps) {
  if (!abierto) return null

  // ✅ Mensaje fijo según QA
  const mensajeFinal =
    'No se puede eliminar la publicación, intente nuevamente'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-sm overflow-hidden rounded-2xl bg-[#F9F6EE] shadow-xl">
        
        <div className="bg-[#F9F6EE] px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-800 text-center">
            Error
          </h2>
        </div>

        <hr className="h-[2px] bg-gray-800" />

        <div className="flex flex-col items-center gap-5 px-4 py-4">
          <p className="text-center font-semibold text-sm text-gray-800">
            {mensajeFinal}
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
  )
}
