import { apiReadiness } from '../config/apiReadiness';
import { mockClients } from '../mocks';
import type { Client as ApiClient } from '../schemas/api/models';
import type { Client } from '../types';
import * as clientsApi from './api/clients';
import { withMockFallback } from './mockFallback';

const TYPE_LABELS: Record<ApiClient['type'], string> = {
  personal: 'Personal',
  group: 'Group',
  online: 'Online',
};

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
