import type { NotificationItem } from '@/types/notification'

export const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'Nueva solicitud',
    description: 'Tienes una nueva notificación.',
    status: 'no leida'
  },
  {
    id: 2,
    title: 'Mensaje recibido',
    description: 'Revisa tu bandeja de entrada.',
    status: 'leida'
  },
  {
    id: 3,
    title: 'Actualización',
    description: 'Tu perfil fue actualizado correctamente.',
    status: 'no leida'
  },
  {
    id: 4,
    title: 'Recordatorio',
    description: 'Tienes una notificación pendiente.',
    status: 'archivada'
  }
]
