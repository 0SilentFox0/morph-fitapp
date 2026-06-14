import { api } from './client';
import type { Query } from './client';
import { dataEnvelope, paginatedEnvelope } from '../../schemas/api/envelope';
import {
  ClientSchema,
  ClientInvitationSchema,
  BodyMeasurementSchema,
  PersonalRecordSchema,
} from '../../schemas/api/models';

export interface ClientInput {
  name: string;
  email?: string;
  phone?: string;
  type: 'personal' | 'group' | 'online';
  notes?: string;
  tags?: string[];
}

export interface MeasurementInput {
  metric_type: 'weight' | 'height' | 'body_fat_percent' | 'chest' | 'waist' | 'hips' | 'biceps' | 'thigh';
  value: number;
  unit: string;
  measured_at: string;
}

export const listClients = (query?: Query) =>
  api.get('/clients', { query, schema: paginatedEnvelope(ClientSchema) });

export const getClient = (id: string) =>
  api.get(`/clients/${id}`, { schema: dataEnvelope(ClientSchema) });

export const createClient = (body: ClientInput) =>
  api.post('/clients', { body, schema: dataEnvelope(ClientSchema) });

export const updateClient = (id: string, body: Partial<ClientInput>) =>
  api.put(`/clients/${id}`, { body, schema: dataEnvelope(ClientSchema) });

export const archiveClient = (id: string) => api.post(`/clients/${id}/archive`);
export const restoreClient = (id: string) => api.post(`/clients/${id}/restore`);

export const inviteClient = (id: string) =>
  api.post(`/clients/${id}/invite`, { schema: dataEnvelope(ClientInvitationSchema) });

export const listMeasurements = (clientId: string, query?: Query) =>
  api.get(`/clients/${clientId}/measurements`, { query, schema: paginatedEnvelope(BodyMeasurementSchema) });

export const recordMeasurement = (clientId: string, body: MeasurementInput) =>
  api.post(`/clients/${clientId}/measurements`, { body, schema: dataEnvelope(BodyMeasurementSchema) });

export const measurementHistory = (clientId: string, query?: Query) =>
  api.get(`/clients/${clientId}/measurements/history`, { query });

export const listPersonalRecords = (clientId: string) =>
  api.get(`/clients/${clientId}/personal-records`, { schema: paginatedEnvelope(PersonalRecordSchema) });
