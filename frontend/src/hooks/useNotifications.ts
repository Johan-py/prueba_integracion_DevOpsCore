"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  NotificationFilter,
  NotificationItem,
  NotificationsResponse,
  UnreadCountResponse,
} from "@/types/notification";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const ITEMS_PER_LOAD = 20;
const NOTIFICATIONS_UPDATED_EVENT = "notifications-updated";
const AUTH_STATE_CHANGED_EVENT = "auth-state-changed";
const SKELETON_DELAY_MS = 300;

type RefreshOptions = {
  silent?: boolean;
};

const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
};

const getAuthHeaders = (): HeadersInit => {
  const token = getStoredToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

const buildNotificationsUrl = (
  filter: NotificationFilter,
  limit: number,
  offset: number,
) => {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  if (filter !== "todas") {
    params.set("filter", filter);
  }

  return `${API_URL}/notificaciones?${params.toString()}`;
};

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => {
    controller.abort();
  }, 8000);

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...getAuthHeaders(),
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(
        data?.message ?? "No se pudo completar la solicitud",
      ) as Error & {
        status?: number;
      };
      error.status = response.status;
      throw error;
    }

    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      const timeoutError = new Error(
        "No se pudieron cargar las notificaciones.",
      ) as Error & {
        status?: number;
      };
      timeoutError.status = 408;
      throw timeoutError;
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
};

export function useNotifications() {
  const [open, setOpen] = useState(false);
  const [filter, setFilterState] = useState<NotificationFilter>("todas");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [hasRealtimeUpdate, setHasRealtimeUpdate] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const savedScrollTopRef = useRef(0);
  const instanceId = useRef(
    `notifications-${Math.random().toString(36).slice(2)}`,
  );
  const eventSourceRef = useRef<EventSource | null>(null);
  const latestRefreshRequestIdRef = useRef(0);
  const wasOpenRef = useRef(false);

  const clearNotificationsState = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setNotifications([]);
    setTotal(0);
    setUnreadCount(0);
    setError(null);
    setOpen(false);
    setIsLoading(false);
    setShowSkeleton(false);
    setIsLoadingMore(false);
    setIsLoggedIn(false);
    savedScrollTopRef.current = 0;
  }, []);

  const emitNotificationsUpdated = useCallback(() => {
    if (typeof window === "undefined") return;

    window.dispatchEvent(
      new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, {
        detail: { source: instanceId.current },
      }),
    );
  }, []);

  const saveScrollPosition = useCallback((value: number) => {
    savedScrollTopRef.current = value;
  }, []);

  const refreshNotifications = useCallback(
    async (nextFilter: NotificationFilter, options: RefreshOptions = {}) => {
      const silent = options.silent ?? false;
      const requestId = latestRefreshRequestIdRef.current + 1;
      latestRefreshRequestIdRef.current = requestId;

      const token = getStoredToken();
      if (!token) {
        clearNotificationsState();
        return;
      }

      if (!window.navigator.onLine) {
        return;
      }

      let skeletonTimer: number | null = null;

      if (!silent) {
        setIsLoading(true);
        setError(null);

        skeletonTimer = window.setTimeout(() => {
          if (latestRefreshRequestIdRef.current === requestId) {
            setShowSkeleton(true);
          }
        }, SKELETON_DELAY_MS);
      }

      try {
        const [notificationsResponse, unreadCountResponse] = await Promise.all([
          requestJson<NotificationsResponse>(
            buildNotificationsUrl(nextFilter, ITEMS_PER_LOAD, 0),
          ),
          requestJson<UnreadCountResponse>(
            `${API_URL}/notificaciones/unread-count`,
          ),
        ]);

        if (latestRefreshRequestIdRef.current !== requestId) {
          return;
        }

        setNotifications(notificationsResponse.items);
        setTotal(notificationsResponse.total);
        setUnreadCount(unreadCountResponse.unreadCount);
        setIsLoggedIn(true);
        setError(null);
      } catch (err) {
        if (latestRefreshRequestIdRef.current !== requestId) {
          return;
        }

        if (!window.navigator.onLine) {
          return;
        }

        const error = err as Error & { status?: number };
        const technicalMessage = error.message.toLowerCase();

        if (
          technicalMessage.includes("no autorizado") ||
          technicalMessage.includes("token") ||
          error.status === 401
        ) {
          clearNotificationsState();
          return;
        }

        if (error.status === 500) {
          setError("Ocurrió un problema al cargar las notificaciones.");
        } else {
          setError("No se pudieron cargar las notificaciones.");
        }
      } finally {
        if (skeletonTimer !== null) {
          window.clearTimeout(skeletonTimer);
        }

        if (latestRefreshRequestIdRef.current !== requestId) {
          return;
        }

        if (!silent) {
          setIsLoading(false);
          setShowSkeleton(false);
        }
      }
    },
    [clearNotificationsState],
  );

  const loadMoreNotifications = useCallback(async () => {
    const token = getStoredToken();

    if (!token) {
      clearNotificationsState();
      return;
    }

    if (isLoading || isLoadingMore || notifications.length >= total) return;

    setIsLoadingMore(true);

    try {
      const response = await requestJson<NotificationsResponse>(
        buildNotificationsUrl(filter, ITEMS_PER_LOAD, notifications.length),
      );

      setNotifications((prev) => [...prev, ...response.items]);
      setTotal(response.total);
    } catch (err) {
      const error = err as Error & { status?: number };

      if (error.status === 401) {
        clearNotificationsState();
        return;
      }

      if (!window.navigator.onLine) return;

      setError("No se pudieron cargar las notificaciones.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    clearNotificationsState,
    filter,
    isLoading,
    isLoadingMore,
    notifications.length,
    total,
  ]);

  const toggleNotifications = () => {
    setOpen((prev) => !prev);
  };

  const changeFilter = useCallback(
    (nextFilter: NotificationFilter) => {
      if (nextFilter === filter) return;

      setFilterState(nextFilter);
      void refreshNotifications(nextFilter, { silent: true });
    },
    [filter, refreshNotifications],
  );

  const markAsRead = useCallback(
    async (id: number) => {
      await requestJson(`${API_URL}/notificaciones/${id}/read`, {
        method: "PATCH",
      });
      await refreshNotifications(filter, { silent: true });
      emitNotificationsUpdated();
    },
    [emitNotificationsUpdated, filter, refreshNotifications],
  );

  const markAllAsRead = useCallback(async () => {
    await requestJson(`${API_URL}/notificaciones/read-all`, {
      method: "PATCH",
    });
    await refreshNotifications(filter, { silent: true });
    emitNotificationsUpdated();
  }, [emitNotificationsUpdated, filter, refreshNotifications]);

  const deleteNotification = useCallback(
    async (id: number) => {
      await requestJson(`${API_URL}/notificaciones/${id}`, {
        method: "DELETE",
      });
      await refreshNotifications(filter, { silent: true });
      emitNotificationsUpdated();
    },
    [emitNotificationsUpdated, filter, refreshNotifications],
  );

  const archiveNotification = useCallback(
    async (id: number) => {
      await requestJson(`${API_URL}/notificaciones/${id}/archivar`, {
        method: "PATCH",
      });
      await refreshNotifications(filter, { silent: true });
      emitNotificationsUpdated();
    },
    [emitNotificationsUpdated, filter, refreshNotifications],
  );

  const hasMore = notifications.length < total;

  useEffect(() => {
    setIsLoggedIn(Boolean(getStoredToken()));
    setIsOnline(window.navigator.onLine);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      void refreshNotifications(filter, { silent: true });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setError(null);

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [filter, refreshNotifications]);

  useEffect(() => {
    void refreshNotifications("todas");
  }, [refreshNotifications]);

  useEffect(() => {
    const handleNotificationsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ source?: string }>;

      if (customEvent.detail?.source === instanceId.current) return;

      void refreshNotifications(filter, { silent: true });
    };

    window.addEventListener(
      NOTIFICATIONS_UPDATED_EVENT,
      handleNotificationsUpdated,
    );

    return () => {
      window.removeEventListener(
        NOTIFICATIONS_UPDATED_EVENT,
        handleNotificationsUpdated,
      );
    };
  }, [filter, refreshNotifications]);

  useEffect(() => {
    const handleAuthStateChanged = () => {
      if (!getStoredToken()) {
        clearNotificationsState();
        return;
      }

      void refreshNotifications(filter, { silent: true });
    };

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === "token" ||
        event.key === "propbol_user" ||
        event.key === "propbol_session_expires"
      ) {
        handleAuthStateChanged();
      }
    };

    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        AUTH_STATE_CHANGED_EVENT,
        handleAuthStateChanged,
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, [clearNotificationsState, filter, refreshNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const restoreScroll = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = savedScrollTopRef.current;
      }
    };

    restoreScroll();

    const frame = window.requestAnimationFrame(restoreScroll);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [open, notifications.length]);

  useEffect(() => {
    savedScrollTopRef.current = 0;

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [filter]);

  // Refrescar silenciosamente al abrir el panel para mostrar datos frescos
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      void refreshNotifications(filter, { silent: true });
    }
    wasOpenRef.current = open;
  }, [open, filter, refreshNotifications]);

  useEffect(() => {
    const token = getStoredToken();

    if (!token || !isLoggedIn || !isOnline) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const streamUrl = `${API_URL}/notificaciones/stream?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(streamUrl);

    eventSourceRef.current = eventSource;

    eventSource.addEventListener("connected", () => {});
    eventSource.addEventListener("created", () => {
      setHasRealtimeUpdate(true);
      void refreshNotifications(filter, { silent: true });

      window.setTimeout(() => {
        setHasRealtimeUpdate(false);
      }, 3000);
    });

    const realtimeEvents = ["read", "read-all", "deleted", "archived"];

    realtimeEvents.forEach((eventName) => {
      eventSource.addEventListener(eventName, () => {
        void refreshNotifications(filter, { silent: true });
      });
    });

    eventSource.addEventListener("ping", () => {});

    eventSource.onerror = () => {
      eventSource.close();
      eventSourceRef.current = null;

      window.setTimeout(() => {
        const latestToken = getStoredToken();

        if (!latestToken || !window.navigator.onLine) return;

        void refreshNotifications(filter, { silent: true });
      }, 2000);
    };

    return () => {
      eventSource.close();

      if (eventSourceRef.current === eventSource) {
        eventSourceRef.current = null;
      }
    };
  }, [filter, isLoggedIn, isOnline, refreshNotifications]);

  // Polling de 60s como fallback cuando SSE no está disponible
  useEffect(() => {
    if (!isLoggedIn || !isOnline) return;

    const interval = window.setInterval(() => {
      void refreshNotifications(filter, { silent: true });
    }, 60000);

    return () => window.clearInterval(interval);
  }, [isLoggedIn, isOnline, filter, refreshNotifications]);

  const filteredNotifications = useMemo(() => notifications, [notifications]);
  const visibleNotifications = useMemo(() => notifications, [notifications]);

  return {
    open,
    filter,
    notifications,
    filteredNotifications,
    visibleNotifications,
    unreadCount,
    isLoading,
    showSkeleton,
    isLoadingMore,
    error,
    isOnline,
    hasRealtimeUpdate,
    notificationRef,
    scrollContainerRef,
    saveScrollPosition,
    toggleNotifications,
    setFilter: changeFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    loadMoreNotifications,
    hasMore,
    refreshNotifications,
    isLoggedIn,
    setIsLoggedIn,
  };
}
