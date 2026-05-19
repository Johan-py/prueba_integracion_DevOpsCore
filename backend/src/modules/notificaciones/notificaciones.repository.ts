import { prisma } from "../../lib/prisma.client.js";

type SupportedNotificationFilter = "todas" | "leida" | "no leida" | "archivada";

type FindNotificationsParams = {
  usuarioId: number;
  filter: SupportedNotificationFilter;
  limit: number;
  offset: number;
};

type CountNotificationsParams = {
  usuarioId: number;
  filter: SupportedNotificationFilter;
};

type FindNotificationByIdParams = {
  id: number;
  usuarioId: number;
};

type MarkNotificationAsReadParams = {
  id: number;
  usuarioId: number;
  fechaLectura: Date;
};

type MarkAllNotificationsAsReadParams = {
  usuarioId: number;
  fechaLectura: Date;
};

type SoftDeleteNotificationParams = {
  id: number;
  usuarioId: number;
};

export type TipoNotificacion =
  | "GENERAL"
  | "BLOG_APROBADO"
  | "BLOG_RECHAZADO"
  | "BLOG_PENDIENTE";

type CreateNotificationParams = {
  usuarioId: number;
  titulo: string;
  mensaje: string;
  tipo?: TipoNotificacion;
  blog_id?: number | null;
};

type ArchiveNotificationParams = {
  id: number;
  usuarioId: number;
};

const buildWhereClause = ({
  usuarioId,
  filter,
}: {
  usuarioId: number;
  filter: SupportedNotificationFilter;
}) => {
  if (filter === "archivada") {
    return { usuarioId, eliminada: false, archivada: true };
  }

  const where: {
    usuarioId: number;
    eliminada: boolean;
    archivada: boolean;
    leida?: boolean;
  } = { usuarioId, eliminada: false, archivada: false };

  if (filter === "leida") where.leida = true;
  if (filter === "no leida") where.leida = false;

  return where;
};

export const findNotificationsByUserRepository = async ({
  usuarioId,
  filter,
  limit,
  offset,
}: FindNotificationsParams) => {
  return prisma.notificacion.findMany({
    where: buildWhereClause({ usuarioId, filter }),
    orderBy: { fechaCreacion: "desc" },
    take: limit,
    skip: offset,
  });
};

export const countNotificationsByUserRepository = async ({
  usuarioId,
  filter,
}: CountNotificationsParams) => {
  return prisma.notificacion.count({
    where: buildWhereClause({ usuarioId, filter }),
  });
};

export const countUnreadNotificationsRepository = async (usuarioId: number) => {
  return prisma.notificacion.count({
    where: { usuarioId, eliminada: false, archivada: false, leida: false },
  });
};

export const findNotificationByIdRepository = async ({
  id,
  usuarioId,
}: FindNotificationByIdParams) => {
  return prisma.notificacion.findFirst({
    where: { id, usuarioId, eliminada: false },
  });
};

export const createNotificationRepository = async ({
  usuarioId,
  titulo,
  mensaje,
  tipo = "GENERAL",
  blog_id = null,
}: CreateNotificationParams) => {
  return prisma.notificacion.create({
    data: {
      usuarioId,
      titulo,
      mensaje,
      tipo,
      blog_id,
      leida: false,
      eliminada: false,
      archivada: false,
      fechaCreacion: new Date(),
      fechaLectura: null,
    },
  });
};

export const markNotificationAsReadRepository = async ({
  id,
  usuarioId,
  fechaLectura,
}: MarkNotificationAsReadParams) => {
  return prisma.notificacion.updateMany({
    where: { id, usuarioId, eliminada: false, leida: false },
    data: { leida: true, fechaLectura },
  });
};

export const markAllNotificationsAsReadRepository = async ({
  usuarioId,
  fechaLectura,
}: MarkAllNotificationsAsReadParams) => {
  return prisma.notificacion.updateMany({
    where: { usuarioId, eliminada: false, archivada: false, leida: false },
    data: { leida: true, fechaLectura },
  });
};

export const softDeleteNotificationRepository = async ({
  id,
  usuarioId,
}: SoftDeleteNotificationParams) => {
  return prisma.notificacion.updateMany({
    where: { id, usuarioId, eliminada: false },
    data: { eliminada: true },
  });
};

export const archiveNotificationRepository = async ({
  id,
  usuarioId,
}: ArchiveNotificationParams) => {
  return prisma.notificacion.updateMany({
    where: { id, usuarioId, eliminada: false },
    data: { archivada: true },
  });
};
