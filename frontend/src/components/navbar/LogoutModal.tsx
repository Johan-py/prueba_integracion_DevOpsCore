type LogoutModalProps = {
  show: boolean
  isLoggingOut: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function LogoutModal({ show, isLoggingOut, onCancel, onConfirm }: LogoutModalProps) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/40 transition-opacity duration-200 ${
        show ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      <div
        className={`bg-[#F9F6EE] w-[360px] rounded-xl shadow-xl px-6 py-6 text-center transition-all duration-200 ${
          show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2'
        }`}
      >
        <h2 className="text-[18px] font-bold text-gray-900 mb-2">¿Cerrar Sesión?</h2>

        <p className="text-sm text-gray-600 mb-6">
          Se finalizará tu sesión actual en este dispositivo.
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            disabled={isLoggingOut}
            className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="flex-1 py-2 rounded-lg bg-[#ff0050] text-white font-semibold shadow-sm hover:bg-[#e60048] transition disabled:opacity-50"
          >
            {isLoggingOut ? 'Cerrando...' : 'Salir'}
          </button>
        </div>
      </div>
    </div>
  )
}
