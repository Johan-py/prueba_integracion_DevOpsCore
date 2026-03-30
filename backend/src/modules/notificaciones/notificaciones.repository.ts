import { prisma } from '../../lib/prisma.js'

type SupportedNotificationFilter = 'todas' | 'leida' | 'no leida'

type FindNotificationsParams = {
  usuarioId: number
  filter: SupportedNotificationFilter
  limit: number
  offset: number
}

type CountNotificationsParams = {
  usuarioId: number
  filter: SupportedNotificationFilter
}

type FindNotificationByIdParams = {
  id: number
  usuarioId: number
}

type MarkNotificationAsReadParams = {
  id: number
  usuarioId: number
  fechaLectura: Date
}

type MarkAllNotificationsAsReadParams = {
  usuarioId: number
  fechaLectura: Date
}

type SoftDeleteNotificationParams = {
  id: number
  usuarioId: number
}

const buildWhereClause = ({
  usuarioId,
  filter
}: {
  usuarioId: number
  filter: SupportedNotificationFilter
}) => {
  const where: {
    usuarioId: number
    eliminada: boolean
    leida?: boolean
  } = {
    usuarioId,
    eliminada: false
  }

  if (filter === 'leida') {
    where.leida = true
  }

  if (filter === 'no leida') {
    where.leida = false
  }

  return where
}

export const findNotificationsByUserRepository = async ({
  usuarioId,
  filter,
  limit,
  offset
}: FindNotificationsParams) => {
  return prisma.notificacion.findMany({
    where: buildWhereClause({ usuarioId, filter }),
    orderBy: {
      fechaCreacion: 'desc'
    },
    take: limit,
    skip: offset
  })
}

export const countNotificationsByUserRepository = async ({
  usuarioId,
  filter
}: CountNotificationsParams) => {
  return prisma.notificacion.count({
    where: buildWhereClause({ usuarioId, filter })
  })
}

export const countUnreadNotificationsRepository = async (usuarioId: number) => {
  return prisma.notificacion.count({
    where: {
      usuarioId,
      eliminada: false,
      leida: false
    }
  })
}

export const findNotificationByIdRepository = async ({
  id,
  usuarioId
}: FindNotificationByIdParams) => {
  return prisma.notificacion.findFirst({
    where: {
      id,
      usuarioId,
      eliminada: false
    }
  })
}

export const markNotificationAsReadRepository = async ({
  id,
  usuarioId,
  fechaLectura
}: MarkNotificationAsReadParams) => {
  return prisma.notificacion.updateMany({
    where: {
      id,
      usuarioId,
      eliminada: false,
      leida: false
    },
    data: {
      leida: true,
      fechaLectura
    }
  })
}

export const markAllNotificationsAsReadRepository = async ({
  usuarioId,
  fechaLectura
}: MarkAllNotificationsAsReadParams) => {
  return prisma.notificacion.updateMany({
    where: {
      usuarioId,
      eliminada: false,
      leida: false
    },
    data: {
      leida: true,
      fechaLectura
    }
  })
}

export const softDeleteNotificationRepository = async ({
  id,
  usuarioId
}: SoftDeleteNotificationParams) => {
  return prisma.notificacion.updateMany({
    where: {
      id,
      usuarioId,
      eliminada: false
    },
    data: {
      eliminada: true
    }
  })
}
