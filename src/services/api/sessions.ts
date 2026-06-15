import { dataEnvelope, paginatedEnvelope } from '../../schemas/api/envelope';
import { SessionSchema } from '../../schemas/api/models';
import type { Query } from './client';
import { api } from './client';

export interface SessionInput {
  title: string;
  type: string;
  start_at: string;
  end_at: string;
  notes?: string;
  program_id?: string;
  client_ids?: string[];
  idempotency_key?: string;
}

export interface SessionSeriesInput {
  title: string;
  type: string;
  duration_minutes: number;
  client_ids?: string[];
  program_id?: string;
  recurrence_rule: Record<string, unknown>;
  timezone: string;
}

export const listSessions = (query?: Query) =>
  api.get('/sessions', { query, schema: paginatedEnvelope(SessionSchema) });

export const getSchedule = (from: string, to: string) =>
  api.get('/sessions/schedule', {
    query: { from, to },
    schema: paginatedEnvelope(SessionSchema),
  });

export const getSession = (id: string) =>
  api.get(`/sessions/${id}`, { schema: dataEnvelope(SessionSchema) });

export const createSession = (body: SessionInput) =>
  api.post('/sessions', { body, schema: dataEnvelope(SessionSchema) });

export const updateSession = (id: string, body: Partial<SessionInput>) =>
  api.put(`/sessions/${id}`, { body, schema: dataEnvelope(SessionSchema) });

export const deleteSession = (id: string) => api.delete(`/sessions/${id}`);

export const cancelSession = (id: string, reason: string) =>
  api.post(`/sessions/${id}/cancel`, {
    body: { reason },
    schema: dataEnvelope(SessionSchema),
  });

export const setSessionStatus = (
  id: string,
  status: 'planned' | 'in_progress' | 'completed' | 'canceled' | 'no_show',
  cancellation_reason?: string
) =>
  api.post(`/sessions/${id}/status`, {
    body: { status, cancellation_reason },
    schema: dataEnvelope(SessionSchema),
  });

export const createSessionSeries = (body: SessionSeriesInput) =>
  api.post('/session-series', { body });
