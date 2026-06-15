import { createClient, listClients } from '../../services/api/clients';
import { tokenStore } from '../../services/api/tokenStore';

const okJson = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

beforeEach(async () => {
  await tokenStore.setTokens({
    access_token: 'a',
    refresh_token: 'r',
    expires_at: 'x',
    token_type: 'Bearer',
  });
  jest.restoreAllMocks();
});

describe('clients service', () => {
  it('listClients returns the paginated envelope', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      okJson({
        data: [
          {
            id: 'c1',
            trainer_id: 't1',
            name: 'Bob',
            type: 'personal',
            status: 'active',
          },
        ],
        meta: { has_more: false },
      })
    );

    const res = await listClients({ status: 'active' });

    expect(res.data).toHaveLength(1);
    expect(res.data[0]!.name).toBe('Bob');
    expect(res.meta?.has_more).toBe(false);
  });

  it('createClient unwraps the single-resource envelope', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      okJson({
        data: {
          id: 'c2',
          trainer_id: 't1',
          name: 'Ann',
          type: 'online',
          status: 'active',
        },
      })
    );

    const res = await createClient({ name: 'Ann', type: 'online' });

    expect(res.data.id).toBe('c2');
  });
});
