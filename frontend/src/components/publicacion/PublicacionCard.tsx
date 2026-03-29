'use client'

import { useDeletePublicacion } from '@/hooks/useDeletePublicacion'
import type { MisPublicacionesItem } from '@/types/publicacion'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import DeleteSuccessModal from './DeleteSuccessModal'
import DeleteErrorModal from './DeleteErrorModal'

interface Props {
  publicacion: MisPublicacionesItem
  onDeleted: (id: number) => void
}

export default function PublicacionCard({ publicacion, onDeleted }: Props) {
  const {
    modalConfirmacionAbierto,
    modalExitoAbierto,
    modalErrorAbierto,
    loading,
    error,
    abrirConfirmacion,
    cerrarConfirmacion,
    cerrarExito,
    cerrarError,
    confirmarEliminacion,
  } = useDeletePublicacion(publicacion.id, () => onDeleted(publicacion.id))

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-[#f3ede6] shadow-sm">
        <img
          src={publicacion.imagenUrl || '/placeholder-house.jpg'}
          alt={publicacion.titulo}
          className="h-44 w-full object-cover"
        />

        <div className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="line-clamp-1 text-lg font-semibold text-gray-900">
              {publicacion.titulo}
            </h3>

            <span className="font-bold text-orange-600">
              ${publicacion.precio.toLocaleString()}
            </span>
          </div>

          <p className="mb-3 text-sm text-gray-600">
            {publicacion.ubicacion}
          </p>

          <div className="mb-4 flex gap-4 text-sm text-gray-700">
            <span>{publicacion.nroBanos ?? '-'} baños</span>
            <span>{publicacion.nroCuartos ?? '-'} cuartos</span>
            <span>{publicacion.superficieM2 ?? '-'} m²</span>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 rounded-full border border-gray-400 px-4 py-2 text-sm text-gray-800">
              Editar
            </button>

            <button
              onClick={abrirConfirmacion}
              className="flex-1 rounded-full bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

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

      <DeleteErrorModal
        abierto={modalErrorAbierto}
        mensaje={error || 'No se puede eliminar la publicación, intente nuevamente'}
        onAceptar={cerrarError}
      />
    </>
  )
}