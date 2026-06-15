import { apiClientToUi, loadClients } from '../../services/clientsService';
import * as clientsApi from '../../services/api/clients';
import type { Client as ApiClient } from '../../schemas/api/models';

const apiClient: ApiClient = {
  id: 'c1',
  trainer_id: 'tr1',
  user_id: null,
  name: 'Brooklyn Simmons',
  email: null,
  phone: null,
  avatar_url: 'https://x/a.png',
  type: 'personal',
  status: 'active',
  notes: null,
  tags: [],
  archived_at: null,
  created_at: null,
  updated_at: null,
};

afterEach(() => jest.restoreAllMocks());

describe('apiClientToUi', () => {
  it('maps the API client type to a display tag and avatar_url to avatar', () => {
    expect(apiClientToUi(apiClient)).toMatchObject({
      id: 'c1',
      name: 'Brooklyn Simmons',
      avatar: 'https://x/a.png',
      tag: 'Personal',
    });
  });

  it('labels group/online types', () => {
    expect(apiClientToUi({ ...apiClient, type: 'group' }).tag).toBe('Group');
    expect(apiClientToUi({ ...apiClient, type: 'online' }).tag).toBe('Online');
  });
});

describe('loadClients', () => {
  it('returns mapped live clients and excludes archived ones', async () => {
    jest.spyOn(clientsApi, 'listClients').mockResolvedValue({
      data: [apiClient, { ...apiClient, id: 'c2', name: 'Archived', archived_at: '2026-01-01T00:00:00Z' }],
    } as never);

    const result = await loadClients();

    expect(clientsApi.listClients).toHaveBeenCalled();
    expect(result.map((c) => c.id)).toEqual(['c1']);
    expect(result[0]!.tag).toBe('Personal');
  });
});
