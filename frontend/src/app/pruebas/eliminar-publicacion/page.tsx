"use client";

import ConfirmDeleteModal from "@/components/publicacion/ConfirmDeleteModal";
import DeleteSuccessModal from "@/components/publicacion/DeleteSuccessModal";
import { useDeletePublicacion } from "@/hooks/useDeletePublicacion";

export default function PruebasEliminarPublicacionPage() {
  const {
    modalConfirmacionAbierto,
    modalExitoAbierto,
    loading,
    error,
    abrirConfirmacion,
    cerrarConfirmacion,
    cerrarExito,
    confirmarEliminacion,
  } = useDeletePublicacion(1); // luego reemplazas por id real

  return (
    <div className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Prueba del modal</h1>

      <button
        onClick={abrirConfirmacion}
        className="rounded-lg bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600"
      >
        Eliminar publicación
      </button>

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <ConfirmDeleteModal
        abierto={modalConfirmacionAbierto}
        onAceptar={confirmarEliminacion}
        onCancelar={cerrarConfirmacion}
        loading={loading}
      />

      <DeleteSuccessModal
        abierto={modalExitoAbierto}
        onAceptar={cerrarExito}
      />
    </div>
  );
}