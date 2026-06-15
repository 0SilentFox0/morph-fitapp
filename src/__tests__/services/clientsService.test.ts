import type { Client as ApiClient } from '../../schemas/api/models';
import * as clientsApi from '../../services/api/clients';
import {
  apiClientToUi,
  buildClientInput,
  createClient,
  loadClients,
  updateClient,
} from '../../services/clientsService';

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
      data: [
        apiClient,
        {
          ...apiClient,
          id: 'c2',
          name: 'Archived',
          archived_at: '2026-01-01T00:00:00Z',
        },
      ],
    } as never);

    const result = await loadClients();

    expect(clientsApi.listClients).toHaveBeenCalled();
    expect(result.map((c) => c.id)).toEqual(['c1']);
    expect(result[0]!.tag).toBe('Personal');
  });
});

describe('buildClientInput', () => {
  it('trims the name and drops empty optional fields', () => {
    expect(
      buildClientInput({ name: '  Bob  ', type: 'group', email: '   ' })
    ).toEqual({ name: 'Bob', type: 'group' });
  });

  it('throws when the name is blank', () => {
    expect(() => buildClientInput({ name: '   ', type: 'personal' })).toThrow();
  });
});

describe('createClient / updateClient', () => {
  it('createClient posts the built input and maps the result to UI', async () => {
    const spy = jest
      .spyOn(clientsApi, 'createClient')
      .mockResolvedValue({ data: { ...apiClient, name: 'Bob' } } as never);

    const result = await createClient({ name: 'Bob', type: 'personal' });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Bob', type: 'personal' })
    );
    expect(result).toMatchObject({ name: 'Bob', tag: 'Personal' });
  });

  it('updateClient puts to the client id', async () => {
    const spy = jest
      .spyOn(clientsApi, 'updateClient')
      .mockResolvedValue({ data: apiClient } as never);

    await updateClient('c1', { name: 'Brooklyn Simmons', type: 'personal' });

    expect(spy).toHaveBeenCalledWith(
      'c1',
      expect.objectContaining({ name: 'Brooklyn Simmons' })
    );
  });
});
