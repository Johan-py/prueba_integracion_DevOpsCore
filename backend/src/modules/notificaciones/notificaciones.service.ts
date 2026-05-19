import {
  archiveNotificationRepository,
  countNotificationsByUserRepository,
  countUnreadNotificationsRepository,
  createNotificationRepository,
  findNotificationByIdRepository,
  findNotificationsByUserRepository,
  markAllNotificationsAsReadRepository,
  markNotificationAsReadRepository,
  softDeleteNotificationRepository,
  type TipoNotificacion,
} from "../notificaciones/notificaciones.repository.js";
import { findUserByCorreo } from "../auth/auth.repository.js";
import { sendNotificationEmail } from "../email/notification-email.service.js";
import { emitNotificationEvent } from "./notificaciones.events.js";
import {
  enviarMensajeWhatsapp,
  formatearTelefono,
} from "../whatsapp/whatsapp.service.js";
import { prisma } from "../../lib/prisma.client.js";

type NotificationFilter = "todas" | "leida" | "no leida" | "archivada";

type GetNotificationsParams = {
  filter?: string;
  limit?: number;
  offset?: number;
};

type GetNotificationByIdParams = {
  id: number;
  usuarioId: number;
};

type CreateNotificationParams = {
  correo: string;
  titulo: string;
  mensaje: string;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_OFFSET = 0;

export class ServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "ServiceError";
    this.statusCode = statusCode;
  }
}

const normalizeFilter = (filter?: string): NotificationFilter => {
  if (filter === "leida") return "leida";
  if (filter === "no leida") return "no leida";
  if (filter === "archivada") return "archivada";
  return "todas";
};

const normalizeLimit = (limit?: number) => {
  if (!Number.isFinite(limit) || !limit || limit < 1) {
    return DEFAULT_LIMIT;
  }
  return Math.min(limit, MAX_LIMIT);
};

const normalizeOffset = (offset?: number) => {
  if (!Number.isFinite(offset) || offset === undefined || offset < 0) {
    return DEFAULT_OFFSET;
  }
  return offset;
};

const validateNotificationId = (id: number) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ServiceError("El id de la notificación no es válido", 400);
  }
};

const mapNotificationToFrontend = (notification: {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean | null;
  archivada?: boolean | null;
  fechaCreacion?: Date | null;
  tipo?: string | null;
  blog_id?: number | null;
}) => {
  return {
    id: notification.id,
    title: notification.titulo,
    description: notification.mensaje,
    status: notification.leida === true ? "leida" : "no leida",
    archivada: notification.archivada === true ? true : false,
    fechaCreacion: notification.fechaCreacion || null,
    tipo: notification.tipo ?? "GENERAL",
    blogId: notification.blog_id ?? null,
  };
};

export const getNotificationsService = async (
  usuarioId: number,
  params: GetNotificationsParams,
) => {
  const filter = normalizeFilter(params.filter);
  const limit = normalizeLimit(params.limit);
  const offset = normalizeOffset(params.offset);

  const [notifications, total] = await Promise.all([
    findNotificationsByUserRepository({
      usuarioId,
      filter,
      limit,
      offset,
    }),
    countNotificationsByUserRepository({
      usuarioId,
      filter,
    }),
  ]);

  return {
    items: notifications.map(mapNotificationToFrontend),
    total,
    limit,
    offset,
  };
};

export const getNotificationByIdService = async ({
  id,
  usuarioId,
}: GetNotificationByIdParams) => {
  const notification = await findNotificationByIdRepository({
    id,
    usuarioId,
  });

  if (!notification) return null;

  return {
    id: notification.id,
    title: notification.titulo,
    description: notification.mensaje,
    status: notification.leida ? "leida" : "no leida",
    archivada: notification.archivada,
    fechaCreacion: notification.fechaCreacion,
    tipo: notification.tipo ?? "GENERAL",
    blogId: notification.blog_id ?? null,
  };
};

export const getUnreadCountService = async (usuarioId: number) => {
  const unreadCount = await countUnreadNotificationsRepository(usuarioId);
  return {
    unreadCount,
  };
};

export const createNotificationService = async ({
  correo,
  titulo,
  mensaje,
}: CreateNotificationParams) => {
  const normalizedCorreo = correo.trim().toLowerCase();
  const normalizedTitle = titulo.trim();
  const normalizedMessage = mensaje.trim();

  if (!normalizedCorreo) {
    throw new ServiceError("El correo del destinatario es obligatorio", 400);
  }

  if (!normalizedTitle) {
    throw new ServiceError("El título de la notificación es obligatorio", 400);
  }

  if (!normalizedMessage) {
    throw new ServiceError("El mensaje de la notificación es obligatorio", 400);
  }

  const user = await findUserByCorreo(normalizedCorreo);

  if (!user) {
    throw new ServiceError("No existe un usuario con ese correo", 404);
  }

  const notification = await createNotificationRepository({
    usuarioId: user.id,
    titulo: normalizedTitle,
    mensaje: normalizedMessage,
  });

  emitNotificationEvent(user.id, "created", notification.id);

  try {
    if (user.correo && user.notificacion_email === true) {
      await sendNotificationEmail({
        emailDestino: user.correo,
        asunto: notification.titulo,
        mensajeHtml: `<p>${notification.mensaje}</p>`,
        mensajeTexto: notification.mensaje,
      });
    }
  } catch (error) {
    console.error("Error enviando correo de notificación:", error);
  }
  try {
    if (user.notificacion_whatsapp === true) {
      const telefonoPrincipal = await prisma.telefono.findFirst({
        where: { usuarioId: user.id, principal: true },
      });

      if (telefonoPrincipal) {
        const numero = formatearTelefono(
          telefonoPrincipal.codigoPais,
          telefonoPrincipal.numero,
        );
        await enviarMensajeWhatsapp({
          telefono: numero,
          mensaje: `*${notification.titulo}*\n\n${notification.mensaje}\n\n_PropBol - Tu plataforma inmobiliaria en Bolivia_`,
        });
      }
    }
  } catch (error) {
    console.error("Error enviando WhatsApp de notificación:", error);
  }

  return {
    message: "Notificación creada correctamente",
    item: mapNotificationToFrontend(notification),
  };
};

export const markNotificationAsReadService = async (
  id: number,
  usuarioId: number,
) => {
  validateNotificationId(id);

  const notification = await findNotificationByIdRepository({
    id,
    usuarioId,
  });

  if (!notification) {
    throw new ServiceError("Notificación no encontrada", 404);
  }

  if (!notification.leida) {
    await markNotificationAsReadRepository({
      id,
      usuarioId,
      fechaLectura: new Date(),
    });

    emitNotificationEvent(usuarioId, "read", id);
  }

  return {
    message: "Notificación marcada como leída",
    item: {
      id: notification.id,
      title: notification.titulo,
      description: notification.mensaje,
      status: "leida",
      archivada: notification.archivada === true ? true : false,
    },
  };
};

export const markAllNotificationsAsReadService = async (usuarioId: number) => {
  const result = await markAllNotificationsAsReadRepository({
    usuarioId,
    fechaLectura: new Date(),
  });

  if (result.count > 0) {
    emitNotificationEvent(usuarioId, "read-all");
  }

  return {
    message: "Notificaciones marcadas como leídas",
    updatedCount: result.count,
  };
};

export const deleteNotificationService = async (
  id: number,
  usuarioId: number,
) => {
  validateNotificationId(id);

  const notification = await findNotificationByIdRepository({
    id,
    usuarioId,
  });

  if (!notification) {
    throw new ServiceError("Notificación no encontrada", 404);
  }

  await softDeleteNotificationRepository({
    id,
    usuarioId,
  });

  emitNotificationEvent(usuarioId, "deleted", id);

  return {
    message: "Notificación eliminada correctamente",
  };
};

type CreateBlogNotificationParams = {
  usuarioId: number;
  blog_id: number;
  blogTitulo: string;
  tipo: Extract<TipoNotificacion, "BLOG_APROBADO" | "BLOG_RECHAZADO">;
  razonRechazo?: string;
};

export const createBlogNotificationService = async ({
  usuarioId,
  blog_id,
  blogTitulo,
  tipo,
  razonRechazo,
}: CreateBlogNotificationParams) => {
  const titulo =
    tipo === "BLOG_APROBADO"
      ? "¡Tu blog fue aprobado!"
      : "Tu blog fue rechazado";

  const mensaje =
    tipo === "BLOG_APROBADO"
      ? `Tu blog "${blogTitulo}" ha sido publicado exitosamente y ya es visible para todos.`
      : (razonRechazo ?? "Tu blog fue rechazado por el administrador.");

  const notification = await createNotificationRepository({
    usuarioId,
    titulo,
    mensaje,
    tipo,
    blog_id,
  });

  emitNotificationEvent(usuarioId, "created", notification.id);

  return notification;
};

export const createAdminBlogPendingNotificationService = async ({
  blog_id,
  blogTitulo,
}: {
  blog_id: number;
  blogTitulo: string;
}) => {
  const admins = await prisma.usuario.findMany({
    where: { rol: { nombre: "ADMIN" }, activo: true },
    select: { id: true },
  });

  if (admins.length === 0) return;

  await Promise.all(
    admins.map(async (admin) => {
      const notification = await createNotificationRepository({
        usuarioId: admin.id,
        titulo: "Blog pendiente de revisión",
        mensaje: `El blog "${blogTitulo}" está esperando tu revisión.`,
        tipo: "BLOG_PENDIENTE",
        blog_id,
      });
      emitNotificationEvent(admin.id, "created", notification.id);
    }),
  );
};

export const archiveNotificationService = async (
  id: number,
  usuarioId: number,
) => {
  validateNotificationId(id);

  const notification = await findNotificationByIdRepository({
    id,
    usuarioId,
  });

  if (!notification) {
    throw new ServiceError("Notificación no encontrada", 404);
  }

  if (notification.archivada) {
    return {
      message: "La notificación ya estaba archivada",
      item: mapNotificationToFrontend(notification),
    };
  }

  await archiveNotificationRepository({ id, usuarioId });
  emitNotificationEvent(usuarioId, "archived", id);

  return {
    message: "Notificación archivada correctamente",
    item: mapNotificationToFrontend({ ...notification, archivada: true }),
  };
};
