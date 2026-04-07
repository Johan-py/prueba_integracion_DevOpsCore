import type { Request, Response } from "express";
import {
  createNotificationService,
  deleteNotificationService,
  getNotificationsService,
  getUnreadCountService,
  markAllNotificationsAsReadService,
  markNotificationAsReadService,
  ServiceError,
} from "../notificaciones/notificaciones.service.ts";

type AuthenticatedRequest = Request & {
  user?: {
    id?: number | string;
  };
};

type NotificationParams = {
  id: string;
};

type CreateNotificationBody = {
  usuarioId?: number | string;
  titulo?: string;
  mensaje?: string;
};

const getUserIdFromRequest = (req: AuthenticatedRequest) => {
  const userId = Number(req.user?.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return userId;
};

const buildErrorResponse = (error: unknown) => {
  if (error instanceof ServiceError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message,
    };
  }

  return {
    statusCode: 500,
    message: "Error interno del servidor",
  };
};

export const getNotificationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const usuarioId = getUserIdFromRequest(req as AuthenticatedRequest);

    if (!usuarioId) {
      return res.status(401).json({
        message: "No autorizado",
      });
    }

    const filter =
      typeof req.query.filter === "string" ? req.query.filter : undefined;
    const limit =
      typeof req.query.limit === "string"
        ? Number.parseInt(req.query.limit, 10)
        : undefined;
    const offset =
      typeof req.query.offset === "string"
        ? Number.parseInt(req.query.offset, 10)
        : undefined;

    const result = await getNotificationsService(usuarioId, {
      filter,
      limit,
      offset,
    });

    return res.status(200).json(result);
  } catch (error) {
    const { statusCode, message } = buildErrorResponse(error);

    return res.status(statusCode).json({
      message,
    });
  }
};

export const getUnreadCountController = async (req: Request, res: Response) => {
  try {
    const usuarioId = getUserIdFromRequest(req as AuthenticatedRequest);

    if (!usuarioId) {
      return res.status(401).json({
        message: "No autorizado",
      });
    }

    const result = await getUnreadCountService(usuarioId);

    return res.status(200).json(result);
  } catch (error) {
    const { statusCode, message } = buildErrorResponse(error);

    return res.status(statusCode).json({
      message,
    });
  }
};

export const createNotificationController = async (
  req: Request<unknown, unknown, CreateNotificationBody>,
  res: Response,
) => {
  try {
    const authenticatedUserId = getUserIdFromRequest(
      req as AuthenticatedRequest,
    );

    if (!authenticatedUserId) {
      return res.status(401).json({
        message: "No autorizado",
      });
    }

    const bodyUserId =
      req.body.usuarioId !== undefined
        ? Number(req.body.usuarioId)
        : authenticatedUserId;

    const result = await createNotificationService({
      usuarioId: bodyUserId,
      titulo: req.body.titulo ?? "",
      mensaje: req.body.mensaje ?? "",
    });

    return res.status(201).json(result);
  } catch (error) {
    const { statusCode, message } = buildErrorResponse(error);

    return res.status(statusCode).json({
      message,
    });
  }
};

export const markNotificationAsReadController = async (
  req: Request<NotificationParams>,
  res: Response,
) => {
  try {
    const usuarioId = getUserIdFromRequest(req as AuthenticatedRequest);

    if (!usuarioId) {
      return res.status(401).json({
        message: "No autorizado",
      });
    }

    const id = Number.parseInt(req.params.id, 10);
    const result = await markNotificationAsReadService(id, usuarioId);

    return res.status(200).json(result);
  } catch (error) {
    const { statusCode, message } = buildErrorResponse(error);

    return res.status(statusCode).json({
      message,
    });
  }
};

export const markAllNotificationsAsReadController = async (
  req: Request,
  res: Response,
) => {
  try {
    const usuarioId = getUserIdFromRequest(req as AuthenticatedRequest);

    if (!usuarioId) {
      return res.status(401).json({
        message: "No autorizado",
      });
    }

    const result = await markAllNotificationsAsReadService(usuarioId);

    return res.status(200).json(result);
  } catch (error) {
    const { statusCode, message } = buildErrorResponse(error);

    return res.status(statusCode).json({
      message,
    });
  }
};

export const deleteNotificationController = async (
  req: Request<NotificationParams>,
  res: Response,
) => {
  try {
    const usuarioId = getUserIdFromRequest(req as AuthenticatedRequest);

    if (!usuarioId) {
      return res.status(401).json({
        message: "No autorizado",
      });
    }

    const id = Number.parseInt(req.params.id, 10);
    const result = await deleteNotificationService(id, usuarioId);

    return res.status(200).json(result);
  } catch (error) {
    const { statusCode, message } = buildErrorResponse(error);

    return res.status(statusCode).json({
      message,
    });
  }
};
