import {
  countNotificationsByUserRepository,
  countUnreadNotificationsRepository,
  findNotificationByIdRepository,
  findNotificationsByUserRepository,
  markAllNotificationsAsReadRepository,
  markNotificationAsReadRepository,
  softDeleteNotificationRepository
} from '../notificaciones/notificaciones.repository.js'

type NotificationFilter = 'todas' | 'leida' | 'no leida' | 'archivada'
type SupportedNotificationFilter = Exclude<NotificationFilter, 'archivada'>

type GetNotificationsParams = {
  filter?: string
  limit?: number
  offset?: number
}

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100
const DEFAULT_OFFSET = 0

export class ServiceError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'ServiceError'
    this.statusCode = statusCode
  }
}

const normalizeFilter = (filter?: string): NotificationFilter => {
  if (filter === 'leida') return 'leida'
  if (filter === 'no leida') return 'no leida'
  if (filter === 'archivada') return 'archivada'
  return 'todas'
}

const normalizeLimit = (limit?: number) => {
  if (!Number.isFinite(limit) || !limit || limit < 1) {
    return DEFAULT_LIMIT
  }

  return Math.min(limit, MAX_LIMIT)
}

const normalizeOffset = (offset?: number) => {
  if (!Number.isFinite(offset) || offset === undefined || offset < 0) {
    return DEFAULT_OFFSET
  }

  return offset
}

const validateNotificationId = (id: number) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ServiceError('El id de la notificación no es válido', 400)
  }
}

const mapNotificationToFrontend = (notification: {
  id: number
  titulo: string
  mensaje: string
  leida: boolean
}) => {
  return {
    id: notification.id,
    title: notification.titulo,
    description: notification.mensaje,
    status: notification.leida ? 'leida' : 'no leida'
  }
}

export const getNotificationsService = async (
  usuarioId: number,
  params: GetNotificationsParams
) => {
  const filter = normalizeFilter(params.filter)
  const limit = normalizeLimit(params.limit)
  const offset = normalizeOffset(params.offset)

  if (filter === 'archivada') {
    return {
      items: [],
      total: 0,
      limit,
      offset,
      message: 'El filtro archivada no está disponible con la estructura actual de la BD.'
    }
  }

  const supportedFilter = filter as SupportedNotificationFilter

  const [notifications, total] = await Promise.all([
    findNotificationsByUserRepository({
      usuarioId,
      filter: supportedFilter,
      limit,
      offset
    }),
    countNotificationsByUserRepository({
      usuarioId,
      filter: supportedFilter
    })
  ])

  return {
    items: notifications.map(mapNotificationToFrontend),
    total,
    limit,
    offset
  }
}

export const getUnreadCountService = async (usuarioId: number) => {
  const unreadCount = await countUnreadNotificationsRepository(usuarioId)

  return {
    unreadCount
  }
}

export const markNotificationAsReadService = async (id: number, usuarioId: number) => {
  validateNotificationId(id)

  const notification = await findNotificationByIdRepository({
    id,
    usuarioId
  })

  if (!notification) {
    throw new ServiceError('Notificación no encontrada', 404)
  }

  if (!notification.leida) {
    await markNotificationAsReadRepository({
      id,
      usuarioId,
      fechaLectura: new Date()
    })
  }

  return {
    message: 'Notificación marcada como leída',
    item: {
      id: notification.id,
      title: notification.titulo,
      description: notification.mensaje,
      status: 'leida'
    }
  }
}

export const markAllNotificationsAsReadService = async (usuarioId: number) => {
  const result = await markAllNotificationsAsReadRepository({
    usuarioId,
    fechaLectura: new Date()
  })

  return {
    message: 'Notificaciones marcadas como leídas',
    updatedCount: result.count
  }
}

export const deleteNotificationService = async (id: number, usuarioId: number) => {
  validateNotificationId(id)

  const notification = await findNotificationByIdRepository({
    id,
    usuarioId
  })

  if (!notification) {
    throw new ServiceError('Notificación no encontrada', 404)
  }

  await softDeleteNotificationRepository({
    id,
    usuarioId
  })

  return {
    message: 'Notificación eliminada correctamente'
  }
}
