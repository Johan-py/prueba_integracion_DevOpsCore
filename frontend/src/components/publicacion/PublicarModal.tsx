








"use client";

import { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";

interface Props {
  onConfirmar: () => void;
  onCancelar: () => void;
  estado: "confirmando" | "publicando" | "exito" | "error_publicacion";
  progreso: number;
  onReintentar: () => void;
  onPausar?: (pausado: boolean) => void; 
}

export default function PublicarModal({
  onConfirmar,
  onCancelar,
  estado,
  progreso,
  onReintentar,
  onPausar,
}: Props) {
  const [checked, setChecked] = useState(false);
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false); 

  const estaPublicando = estado === "publicando";
  const esExito = estado === "exito";
  const esError = estado === "error_publicacion";

  useEffect(() => {
    if (!estaPublicando) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [estaPublicando]);

  const handleCancelar = () => {
    if (estaPublicando) {
      setMostrarAdvertencia(true);
      if (onPausar) onPausar(true); // Pausamos la barra en el padre
    } else {
      onCancelar();
    }
  };

  const confirmarCancelacion = () => {
    setMostrarAdvertencia(false);
    if (onPausar) onPausar(false);
    onCancelar(); // Dispara la orden de abortar en el padre
  };

  const reanudarPublicacion = () => {
    setMostrarAdvertencia(false);
    if (onPausar) onPausar(false); // Reanudamos la barra en el padre
  };

  return (
    // Overlay oscuro
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative overflow-hidden">
        
        {/* 🟢 NUEVA VISTA: ADVERTENCIA CUSTOM */}
        {mostrarAdvertencia ? (
          <div className="flex flex-col items-center text-center py-2 animate-in fade-in duration-200">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-800">¿Desea cancelar la publicación en curso?</h3>
            <p className="mb-8 text-sm text-gray-500">
              El proceso se detendrá y tendrás que empezar de nuevo.
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={reanudarPublicacion}
                className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                NO, continuar
              </button>
              <button
                onClick={confirmarCancelacion}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                SÍ, cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-200">
            {/* VISTA ORIGINAL DEL MODAL */}
            {/* Título */}
            <h2 className="text-xl font-bold text-gray-800">Publicar inmueble</h2>
            <p className="mb-5 text-sm text-gray-400">
              Confirma los datos y completa la publicación
            </p>

            {/* Checkbox de confirmación */}
            <label className="mb-5 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                disabled={estaPublicando || esExito}
                className="mt-0.5 h-4 w-4 accent-orange-500"
              />
              <span className="text-sm text-gray-700">
                Confirme que la información es correcta y deseo publicar
                <br />
                <span className="text-xs text-gray-400">
                  Nota: Puedes publicar hasta 2 inmuebles de forma gratuita.
                </span>
              </span>
            </label>

            {/* Barra de progreso */}
            <div className="mb-5">
              <ProgressBar progreso={progreso} />
            </div>

            {/* Mensajes */}
            {esExito && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                ✅ ¡Inmueble publicado exitosamente!
              </div>
            )}
            {esError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                ❌ Ocurrió un error al publicar. Tus datos no se perdieron.
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              {!esExito && (
                <button
                  onClick={handleCancelar}
                  disabled={false}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
              )}

              {esError ? (
                <button
                  onClick={onReintentar}
                  className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Reintentar
                </button>
              ) : esExito ? (
                <button
                  onClick={onCancelar}
                  className="w-full rounded-lg bg-green-500 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
                >
                  Cerrar
                </button>
              ) : (
                <button
                  onClick={onConfirmar}
                  disabled={!checked || estaPublicando}
                  className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {estaPublicando ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Publicando...
                    </span>
                  ) : (
                    "Publicar inmueble"
                  )}
                </button>
              )}
            </div>

            {estaPublicando && (
              <p className="mt-3 text-center text-xs text-gray-400">
                No cierres esta ventana durante la publicación
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}