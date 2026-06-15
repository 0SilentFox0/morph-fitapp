import { dataEnvelope, paginatedEnvelope } from '../../schemas/api/envelope';
import {
  ClientPackageSchema,
  PackageTemplateSchema,
} from '../../schemas/api/models';
import type { Query } from './client';
import { api } from './client';

export interface PackageTemplateInput {
  name: string;
  kind: 'count_based' | 'time_based' | 'hybrid';
  sessions_count: number;
  validity_days: number;
  price: number;
  currency: string;
  auto_renew_default?: boolean;
}

export interface AssignPackageInput {
  client_id: string;
  template_id?: string;
  kind: 'count_based' | 'time_based' | 'hybrid';
  sessions_count: number;
  validity_days: number;
  price: number;
  currency: string;
  auto_renew?: boolean;
}

export const listClientPackages = (query?: Query) =>
  api.get('/client-packages', {
    query,
    schema: paginatedEnvelope(ClientPackageSchema),
  });

export const getClientPackage = (id: string) =>
  api.get(`/client-packages/${id}`, {
    schema: dataEnvelope(ClientPackageSchema),
  });

export const assignPackage = (body: AssignPackageInput) =>
  api.post('/client-packages', {
    body,
    schema: dataEnvelope(ClientPackageSchema),
  });

export const archiveClientPackage = (id: string) =>
  api.post(`/client-packages/${id}/archive`);

export const listPackageTemplates = (query?: Query) =>
  api.get('/package-templates', {
    query,
    schema: paginatedEnvelope(PackageTemplateSchema),
  });

export const getPackageTemplate = (id: string) =>
  api.get(`/package-templates/${id}`, {
    schema: dataEnvelope(PackageTemplateSchema),
  });

export const createPackageTemplate = (body: PackageTemplateInput) =>
  api.post('/package-templates', {
    body,
    schema: dataEnvelope(PackageTemplateSchema),
  });

export const updatePackageTemplate = (
  id: string,
  body: Partial<PackageTemplateInput>
) =>
  api.put(`/package-templates/${id}`, {
    body,
    schema: dataEnvelope(PackageTemplateSchema),
  });

export const archivePackageTemplate = (id: string) =>
  api.post(`/package-templates/${id}/archive`);
