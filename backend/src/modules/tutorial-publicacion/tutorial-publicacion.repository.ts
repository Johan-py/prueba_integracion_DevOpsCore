import { prisma } from "../../lib/prisma.client.js";
import type { TutorialPublicacionEstadoRecord } from "./tutorial-publicacion.types.js";

const mapTutorialEstadoRecord = (record: {
  id: number;
  usuario_id: number;
  confirmado: boolean;
  confirmado_en: Date | null;
}): TutorialPublicacionEstadoRecord => ({
  id: record.id,
  usuarioId: record.usuario_id,
  confirmado: record.confirmado,
  confirmadoEn: record.confirmado_en,
});

export const findTutorialEstadoByUsuarioIdRepository = async (
  usuarioId: number,
): Promise<TutorialPublicacionEstadoRecord | null> => {
  const record = await prisma.tutorial_publicacion_usuario.findUnique({
    where: { usuario_id: usuarioId },
    select: {
      id: true,
      usuario_id: true,
      confirmado: true,
      confirmado_en: true,
    },
  });

  return record ? mapTutorialEstadoRecord(record) : null;
};

export const upsertTutorialConfirmadoRepository = async (
  usuarioId: number,
): Promise<TutorialPublicacionEstadoRecord> => {
  const now = new Date();

  const record = await prisma.tutorial_publicacion_usuario.upsert({
    where: { usuario_id: usuarioId },
    create: {
      usuario_id: usuarioId,
      confirmado: true,
      confirmado_en: now,
    },
    update: {
      confirmado: true,
      confirmado_en: now,
    },
    select: {
      id: true,
      usuario_id: true,
      confirmado: true,
      confirmado_en: true,
    },
  });

  return mapTutorialEstadoRecord(record);
};
