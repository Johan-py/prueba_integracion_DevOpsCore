import { TUTORIAL_PUBLICACION_CONTENT } from "./tutorial-publicacion.constants.js";
import {
  findTutorialEstadoByUsuarioIdRepository,
  upsertTutorialConfirmadoRepository,
} from "./tutorial-publicacion.repository.js";
import type {
  ConfirmTutorialInput,
  ConfirmTutorialResult,
  GetTutorialEstadoInput,
  TutorialPublicacionContent,
  TutorialPublicacionEstado,
} from "./tutorial-publicacion.types.js";

export const getTutorialPublicacionContentService =
  async (): Promise<TutorialPublicacionContent> => {
    return TUTORIAL_PUBLICACION_CONTENT;
  };

export const getTutorialPublicacionEstadoService = async ({
  usuario_id,
}: GetTutorialEstadoInput): Promise<TutorialPublicacionEstado> => {
  const estado = await findTutorialEstadoByUsuarioIdRepository(usuario_id);

  if (!estado) {
    return {
      debeMostrarTutorial: true,
      confirmado: false,
      confirmadoEn: null,
    };
  }

  return {
    debeMostrarTutorial: !estado.confirmado,
    confirmado: estado.confirmado,
    confirmadoEn: estado.confirmadoEn
      ? estado.confirmadoEn.toISOString()
      : null,
  };
};

export const confirmTutorialPublicacionService = async ({
  usuario_id,
}: ConfirmTutorialInput): Promise<ConfirmTutorialResult> => {
  const estado = await upsertTutorialConfirmadoRepository(usuario_id);

  return {
    debeMostrarTutorial: false,
    confirmado: estado.confirmado,
    confirmadoEn: estado.confirmadoEn
      ? estado.confirmadoEn.toISOString()
      : null,
  };
};

