import { apiReadiness } from '../config/apiReadiness';
import { mockClients } from '../mocks';
import type { Client as ApiClient } from '../schemas/api/models';
import type { Client } from '../types';
import type { ClientInput } from './api/clients';
import * as clientsApi from './api/clients';
import { withMockFallback } from './mockFallback';

const TYPE_LABELS: Record<ApiClient['type'], string> = {
  personal: 'Personal',
  group: 'Group',
  online: 'Online',
};

/** The trainer-editable client types, in display order. */
export const CLIENT_TYPES: ApiClient['type'][] = [
  'personal',
  'group',
  'online',
];

/** Raw values from the Add/Edit Client form. */
export interface ClientFormValues {
  name: string;
  type: ApiClient['type'];
  email?: string;
  phone?: string;
  notes?: string;
}

/** Pure, validated adapter: form values → backend `ClientInput`. */
export function buildClientInput(form: ClientFormValues): ClientInput {
  const name = form.name.trim();

  if (!name) throw new Error('Client name is required');

  return {
    name,
    type: form.type,
    ...(form.email?.trim() ? { email: form.email.trim() } : {}),
    ...(form.phone?.trim() ? { phone: form.phone.trim() } : {}),
    ...(form.notes?.trim() ? { notes: form.notes.trim() } : {}),
  };
}

/** Adapt a backend client to the trainer-side UI list/card shape. */
export function apiClientToUi(c: ApiClient): Client {
  return {
    id: c.id,
    name: c.name,
    avatar: c.avatar_url ?? undefined,
    tag: TYPE_LABELS[c.type],
  };
}

/**
 * Load the trainer's active clients. Lives behind the `clients` readiness flag
 * so it transparently serves mock data until the endpoint is deployed.
 */
export async function loadClients(): Promise<Client[]> {
  return withMockFallback(
    apiReadiness.clients,
    async () => {
      const res = await clientsApi.listClients({ per_page: 100 });

      return res.data.filter((c) => !c.archived_at).map(apiClientToUi);
    },
    () => mockClients
  );
}

/** Create a client. Lives behind the `clients` readiness flag. */
export async function createClient(form: ClientFormValues): Promise<Client> {
  const input = buildClientInput(form);

  return withMockFallback(
    apiReadiness.clients,
    async () => apiClientToUi((await clientsApi.createClient(input)).data),
    () => ({ id: `mock-${input.name}`, name: input.name, tag: TYPE_LABELS[input.type] })
  );
}

/** Update an existing client. */
export async function updateClient(
  id: string,
  form: ClientFormValues
): Promise<Client> {
  const input = buildClientInput(form);

  return withMockFallback(
    apiReadiness.clients,
    async () => apiClientToUi((await clientsApi.updateClient(id, input)).data),
    () => ({ id, name: input.name, tag: TYPE_LABELS[input.type] })
  );
}
