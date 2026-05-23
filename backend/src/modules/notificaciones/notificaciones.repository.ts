import { prisma } from "../../lib/prisma.client.js";

type SupportedNotificationFilter = "todas" | "leida" | "no leida" | "archivada";

type FindNotificationsParams = {
  usuario_id: number;
  filter: SupportedNotificationFilter;
  limit: number;
  offset: number;
};

type CountNotificationsParams = {
  usuario_id: number;
  filter: SupportedNotificationFilter;
};

type FindNotificationByIdParams = {
  id: number;
  usuario_id: number;
};

type MarkNotificationAsReadParams = {
  id: number;
  usuario_id: number;
  fecha_lectura: Date;
};

type MarkAllNotificationsAsReadParams = {
  usuario_id: number;
  fecha_lectura: Date;
};

type SoftDeleteNotificationParams = {
  id: number;
  usuario_id: number;
};

export type TipoNotificacion =
  | "GENERAL"
  | "BLOG_APROBADO"
  | "BLOG_RECHAZADO"
  | "BLOG_PENDIENTE"
  | "PAGO_APROBADO"
  | "PAGO_PENDIENTE";

type CreateNotificationParams = {
  usuario_id: number;
  titulo: string;
  mensaje: string;
  tipo?: TipoNotificacion;
  blog_id?: number | null;
};

type ArchiveNotificationParams = {
  id: number;
  usuario_id: number;
};

const buildWhereClause = ({
  usuario_id,
  filter,
}: {
  usuario_id: number;
  filter: SupportedNotificationFilter;
}) => {
  if (filter === "archivada") {
    return { usuario_id, eliminada: false, archivada: true };
  }

  const where: {
    usuario_id: number;
    eliminada: boolean;
    archivada: boolean;
    leida?: boolean;
  } = { usuario_id, eliminada: false, archivada: false };

  if (filter === "leida") where.leida = true;
  if (filter === "no leida") where.leida = false;

  return where;
};

export const findNotificationsByUserRepository = async ({
  usuario_id,
  filter,
  limit,
  offset,
}: FindNotificationsParams) => {
  return prisma.notificacion.findMany({
    where: buildWhereClause({ usuario_id, filter }),
    orderBy: { fecha_creacion: "desc" },
    take: limit,
    skip: offset,
  });
};

export const countNotificationsByUserRepository = async ({
  usuario_id,
  filter,
}: CountNotificationsParams) => {
  return prisma.notificacion.count({
    where: buildWhereClause({ usuario_id, filter }),
  });
};

export const countUnreadNotificationsRepository = async (usuario_id: number) => {
  return prisma.notificacion.count({
    where: { usuario_id, eliminada: false, archivada: false, leida: false },
  });
};

export const findNotificationByIdRepository = async ({
  id,
  usuario_id,
}: FindNotificationByIdParams) => {
  return prisma.notificacion.findFirst({
    where: { id, usuario_id, eliminada: false },
  });
};

export const createNotificationRepository = async ({
  usuario_id,
  titulo,
  mensaje,
  tipo = "GENERAL",
  blog_id = null,
}: CreateNotificationParams) => {
  return prisma.notificacion.create({
    data: {
      usuario_id,
      titulo,
      mensaje,
      tipo,
      blog_id,
      leida: false,
      eliminada: false,
      archivada: false,
      fecha_creacion: new Date(),
      fecha_lectura: null,
    },
  });
};

export const markNotificationAsReadRepository = async ({
  id,
  usuario_id,
  fecha_lectura,
}: MarkNotificationAsReadParams) => {
  return prisma.notificacion.updateMany({
    where: { id, usuario_id, eliminada: false, leida: false },
    data: { leida: true, fecha_lectura },
  });
};

export const markAllNotificationsAsReadRepository = async ({
  usuario_id,
  fecha_lectura,
}: MarkAllNotificationsAsReadParams) => {
  return prisma.notificacion.updateMany({
    where: { usuario_id, eliminada: false, archivada: false, leida: false },
    data: { leida: true, fecha_lectura },
  });
};

export const softDeleteNotificationRepository = async ({
  id,
  usuario_id,
}: SoftDeleteNotificationParams) => {
  return prisma.notificacion.updateMany({
    where: { id, usuario_id, eliminada: false },
    data: { eliminada: true },
  });
};

export const archiveNotificationRepository = async ({
  id,
  usuario_id,
}: ArchiveNotificationParams) => {
  return prisma.notificacion.updateMany({
    where: { id, usuario_id, eliminada: false },
    data: { archivada: true },
  });
};

