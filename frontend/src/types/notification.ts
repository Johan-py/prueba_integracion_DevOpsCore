export type NotificationStatus = 'leida' | 'no leida' | 'archivada'

export type NotificationItem = {
  id: number
  title: string
  description: string
  status: NotificationStatus
}
