import type { NotificationItem } from '@/types/notification'

const generated: NotificationItem[] = Array.from({ length: 50 }, (_, index) => ({
  id: index + 4,
  title: `Notificación ${index + 4}`,
  description: `Este es el contenido de la notificación ${index + 4}.`,
  status: index % 3 === 0 ? 'no leida' : index % 3 === 1 ? 'leida' : 'archivada'
}))

export const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: '',
    description: '',
    status: 'no leida'
  },
  {
    id: 2,
    title: 'Notificación 2',
    description: '',
    status: 'no leida'
  },
  {
    id: 3,
    title: '',
    description: 'Este es el contenido de la notificación 3',
    status: 'no leida'
  },
  ...generated
]
