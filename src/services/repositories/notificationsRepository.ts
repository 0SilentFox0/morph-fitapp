import { apiReadiness } from '../../config/apiReadiness';
import type { Notification as ApiNotification } from '../../schemas/api/models';
import * as notificationsApi from '../api/notifications';
import { withMockFallback } from '../mockFallback';

/** UI shape for an in-app notification row. */
export interface UiNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export function apiNotificationToUi(n: ApiNotification): UiNotification {
  return {
    id: n.id,
    title: n.title,
    body: n.body,
    createdAt: n.created_at,
    read: n.read_at != null,
  };
}

/** Load the notification feed (newest first). Behind `notifications` readiness. */
export async function loadNotifications(): Promise<UiNotification[]> {
  return withMockFallback(
    apiReadiness.notifications,
    async () => {
      const res = await notificationsApi.listNotifications({ per_page: 50 });

      return res.data.map(apiNotificationToUi);
    },
    () => []
  );
}

/** Unread badge count for the home bell. */
export async function loadUnreadCount(): Promise<number> {
  return withMockFallback(
    apiReadiness.notifications,
    async () => (await notificationsApi.unreadCount()).data.unread_count,
    () => 0
  );
}

export async function markRead(id: string): Promise<void> {
  await withMockFallback(
    apiReadiness.notifications,
    async () => {
      await notificationsApi.markNotificationRead(id);
    },
    () => undefined
  );
}

export async function markAllRead(): Promise<void> {
  await withMockFallback(
    apiReadiness.notifications,
    async () => {
      await notificationsApi.markAllNotificationsRead();
    },
    () => undefined
  );
}
