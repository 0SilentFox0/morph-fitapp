import { api } from './client';
import type { Query } from './client';
import { dataEnvelope, paginatedEnvelope } from '../../schemas/api/envelope';
import { NotificationSchema } from '../../schemas/api/models';
import { z } from 'zod';

export interface DeviceTokenInput {
  token: string;
  platform: 'ios' | 'android';
  device_label?: string;
  app_version?: string;
}

export const listNotifications = (query?: Query) =>
  api.get('/notifications', { query, schema: paginatedEnvelope(NotificationSchema) });

export const unreadCount = () =>
  api.get('/notifications/unread-count', { schema: dataEnvelope(z.object({ count: z.number() })) });

export const markNotificationRead = (id: string) => api.post(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.post('/notifications/read-all');

export const registerDeviceToken = (body: DeviceTokenInput) =>
  api.post('/device-tokens', { body });

export const removeDeviceToken = (token: string) => api.delete(`/device-tokens/${token}`);
