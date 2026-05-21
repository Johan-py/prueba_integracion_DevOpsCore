import { EventEmitter } from "node:events";

export type NotificationRealtimeEventType =
  | "connected"
  | "created"
  | "read"
  | "read-all"
  | "deleted"
  | "archived";

export type NotificationRealtimeEvent = {
  type: NotificationRealtimeEventType;
  userId: number;
  notificationId?: number;
  timestamp: string;
};

const notificationsEmitter = new EventEmitter();

notificationsEmitter.setMaxListeners(100);

const buildChannelName = (userId: number) => `notifications:user:${userId}`;

export const emitNotificationEvent = (
  userId: number,
  type: NotificationRealtimeEventType,
  notificationId?: number,
) => {
  const payload: NotificationRealtimeEvent = {
    type,
    userId,
    notificationId,
    timestamp: new Date().toISOString(),
  };

  notificationsEmitter.emit(buildChannelName(userId), payload);
};

export const subscribeToNotificationEvents = (
  userId: number,
  listener: (payload: NotificationRealtimeEvent) => void,
) => {
  const channelName = buildChannelName(userId);

  notificationsEmitter.on(channelName, listener);

  return () => {
    notificationsEmitter.off(channelName, listener);
  };
};
