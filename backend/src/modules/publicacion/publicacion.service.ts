import {
  buscarPublicacionPorIdRepository,
  eliminarLogicamentePublicacionRepository
} from './publicacion.repository.js'

export const eliminarPublicacionService = async (
  publicacionId: number,
  usuarioSolicitanteId: number
) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error('ID_INVALIDO')
  }

  if (Number.isNaN(usuarioSolicitanteId) || usuarioSolicitanteId <= 0) {
    throw new Error('USUARIO_INVALIDO')
  }

  const publicacion = await buscarPublicacionPorIdRepository(publicacionId)

  if (!publicacion) {
    throw new Error('PUBLICACION_NO_EXISTE')
  }

  if (publicacion.usuarioId !== usuarioSolicitanteId) {
    throw new Error('NO_AUTORIZADO')
  }

  if (publicacion.estado === 'ELIMINADA') {
    throw new Error('PUBLICACION_YA_ELIMINADA')
  }

  await eliminarLogicamentePublicacionRepository(publicacion.id, publicacion.inmuebleId)

  return {
    id: publicacion.id,
    estado: 'ELIMINADA'
  }
}
