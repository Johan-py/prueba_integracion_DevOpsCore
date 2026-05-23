import type { tipo_multimedia } from "@prisma/client";
import { prisma } from "../../lib/prisma.client.js";
import type {
  MultimediaRecord,
  MultimediaType,
  PublicacionRecord,
} from "./multimedia.types.js";

const mapPublicationRecord = (publication: {
  id: number;
  usuario_id: number;
  titulo: string;
}): PublicacionRecord => {
  return {
    id: publication.id,
    usuario_id: publication.usuario_id,
    titulo: publication.titulo,
  };
};

const mapMultimediaRecord = (multimedia: {
  id: number;
  publicacion_id: number;
  tipo: tipo_multimedia;
  url: string;
  peso_mb: unknown;
}): MultimediaRecord => {
  return {
    id: multimedia.id,
    publicacion_id: multimedia.publicacion_id,
    tipo: multimedia.tipo as MultimediaType,
    url: multimedia.url,
    peso_mb:
      multimedia.peso_mb === null || multimedia.peso_mb === undefined
        ? null
        : Number(multimedia.peso_mb),
  };
};

export const findPublicationByIdRepository = async (
  publicacionId: number,
): Promise<PublicacionRecord | null> => {
  const publication = await prisma.publicacion.findUnique({
    where: { id: publicacionId },
    select: {
      id: true,
      usuario_id: true,
      titulo: true,
    },
  });

  return publication ? mapPublicationRecord(publication) : null;
};

export const getMultimediaByPublicationIdRepository = async (
  publicacionId: number,
): Promise<MultimediaRecord[]> => {
  const multimedia = await prisma.multimedia.findMany({
    where: { publicacion_id: publicacionId },
    orderBy: { id: "asc" },
    select: {
      id: true,
      publicacion_id: true,
      tipo: true,
      url: true,
      peso_mb: true,
    },
  });

  return multimedia.map(mapMultimediaRecord);
};

export const countMultimediaByPublicationIdAndTypeRepository = async (
  publicacionId: number,
  tipo: MultimediaType,
): Promise<number> => {
  return prisma.multimedia.count({
    where: {
      publicacion_id: publicacionId,
      tipo: tipo as tipo_multimedia,
    },
  });
};

export const createMultimediaRepository = async (
  data: Omit<MultimediaRecord, "id">,
): Promise<MultimediaRecord> => {
  const created = await prisma.multimedia.create({
    data: {
      publicacion_id: data.publicacion_id,
      tipo: data.tipo as tipo_multimedia,
      url: data.url,
      peso_mb: data.peso_mb ?? null,
    },
    select: {
      id: true,
      publicacion_id: true,
      tipo: true,
      url: true,
      peso_mb: true,
    },
  });

  return mapMultimediaRecord(created);
};

export const createManyMultimediaRepository = async (
  items: Array<Omit<MultimediaRecord, "id">>,
): Promise<MultimediaRecord[]> => {
  if (items.length === 0) {
    return [];
  }

  const createdItems = await prisma.$transaction(
    items.map((item) =>
      prisma.multimedia.create({
        data: {
          publicacion_id: item.publicacion_id,
          tipo: item.tipo as tipo_multimedia,
          url: item.url,
          peso_mb: item.peso_mb ?? null,
        },
        select: {
          id: true,
          publicacion_id: true,
          tipo: true,
          url: true,
          peso_mb: true,
        },
      }),
    ),
  );

  return createdItems.map(mapMultimediaRecord);
};
