// backend/src/modules/publicaciones/publicacion.service.ts
import {
  buscarPublicacionesPorUsuarioRepository,
  buscarPublicacionPorIdRepository,
  eliminarLogicamentePublicacionRepository,
} from "./publicacion.repository.ts";

/**
 * HU1 - Listar publicaciones propias
 * - Solo permite listar publicaciones activas del usuario autenticado
 * - Devuelve datos relevantes para mostrar en la vista
 */
export const listarMisPublicacionesService = async (usuarioId: number) => {
  if (Number.isNaN(usuarioId) || usuarioId <= 0) {
    throw new Error("USUARIO_INVALIDO");
  }

  const publicaciones =
    await buscarPublicacionesPorUsuarioRepository(usuarioId);

  type PublicacionesPorUsuario = Awaited<
    ReturnType<typeof buscarPublicacionesPorUsuarioRepository>
  >;

  return publicaciones.map((publicacion: PublicacionesPorUsuario[number]) => ({
    id: publicacion.id,
    titulo: publicacion.titulo,
    precio: Number(publicacion.inmueble.precio),
    ubicacion:
      publicacion.inmueble.ubicacion?.direccion || "Ubicación no disponible",
    nroBanos: publicacion.inmueble.nroBanos,
    nroCuartos: publicacion.inmueble.nroCuartos,
    superficieM2: publicacion.inmueble.superficieM2
      ? Number(publicacion.inmueble.superficieM2)
      : null,
    imagenUrl: publicacion.multimedia?.[0]?.url ?? null,
  }));
};

/**
 * HU1 - Eliminar publicación propia
 * - Solo permite eliminar publicaciones del usuario autenticado
 * - Elimina de forma lógica (estado = ELIMINADA, inmueble = INACTIVO)
 */
export const eliminarPublicacionService = async (
  publicacionId: number,
  usuarioSolicitanteId: number,
) => {
  if (Number.isNaN(publicacionId) || publicacionId <= 0) {
    throw new Error("ID_INVALIDO");
  }

  if (Number.isNaN(usuarioSolicitanteId) || usuarioSolicitanteId <= 0) {
    throw new Error("USUARIO_INVALIDO");
  }

  const publicacion = await buscarPublicacionPorIdRepository(publicacionId);

  if (!publicacion) {
    throw new Error("PUBLICACION_NO_EXISTE");
  }

  if (publicacion.usuarioId !== usuarioSolicitanteId) {
    throw new Error("NO_AUTORIZADO");
  }

  if (publicacion.estado === "ELIMINADA") {
    throw new Error("PUBLICACION_YA_ELIMINADA");
  }

  await eliminarLogicamentePublicacionRepository(
    publicacion.id,
    publicacion.inmuebleId,
  );

  return {
    id: publicacion.id,
    estado: "ELIMINADA",
  };
};
