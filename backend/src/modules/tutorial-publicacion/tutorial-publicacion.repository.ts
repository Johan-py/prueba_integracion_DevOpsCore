import { prisma } from "../../lib/prisma.client.js";
import type { TutorialPublicacionEstadoRecord } from "./tutorial-publicacion.types.js";

const mapTutorialEstadoRecord = (record: {
  id: number;
  usuarioId: number;
  confirmado: boolean;
  confirmado_en: Date | null;
}): TutorialPublicacionEstadoRecord => ({
  id: record.id,
  usuarioId: record.usuarioId,
  confirmado: record.confirmado,
  confirmadoEn: record.confirmado_en,
});

export const findTutorialEstadoByUsuarioIdRepository = async (
  usuarioId: number,
): Promise<TutorialPublicacionEstadoRecord | null> => {
  const record = await prisma.tutorial_publicacion_usuario.findUnique({
    where: { usuarioId: usuarioId },
    select: {
      id: true,
      usuarioId: true,
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
    where: { usuarioId: usuarioId },
    create: {
      usuarioId: usuarioId,
      confirmado: true,
      confirmado_en: now,
    },
    update: {
      confirmado: true,
      confirmado_en: now,
    },
    select: {
      id: true,
      usuarioId: true,
      confirmado: true,
      confirmado_en: true,
    },
  });

  return mapTutorialEstadoRecord(record);
};

