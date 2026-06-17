import { z } from 'zod';

import { dataEnvelope, paginatedEnvelope } from '../../schemas/api/envelope';
import { NotificationSchema } from '../../schemas/api/models';
import type { Query } from './client';
import { api } from './client';

// The live backend returns `{ data: { count: number } }`, while the OpenAPI
// spec still documents `unread_count`. Accept either and normalize to
// `unread_count` so consumers have one stable field regardless of which ships.
const UnreadCountSchema = z
  .object({
    count: z.number().optional(),
    unread_count: z.number().optional(),
  })
  .transform((v) => ({ unread_count: v.unread_count ?? v.count ?? 0 }));

export interface DeviceTokenInput {
  token: string;
  platform: 'ios' | 'android';
  device_label?: string;
  app_version?: string;
}

export const listNotifications = (query?: Query) =>
  api.get('/notifications', {
    query,
    schema: paginatedEnvelope(NotificationSchema),
  });

export const unreadCount = () =>
  api.get('/notifications/unread-count', {
    schema: dataEnvelope(UnreadCountSchema),
  });

export const markNotificationRead = (id: string) =>
  api.post(`/notifications/${id}/read`);
export const markAllNotificationsRead = () =>
  api.post('/notifications/read-all');

export const registerDeviceToken = (body: DeviceTokenInput) =>
  api.post('/device-tokens', { body });

export const removeDeviceToken = (token: string) =>
  api.delete(`/device-tokens/${token}`);
