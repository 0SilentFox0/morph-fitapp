import * as auth from '../../services/api/auth';
import { tokenStore } from '../../services/api/tokenStore';

const okJson = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

beforeEach(async () => {
  await tokenStore.clear();
  jest.restoreAllMocks();
});

describe('auth service', () => {
  it('login persists the returned tokens', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      okJson({
        data: {
          access_token: 'a',
          refresh_token: 'r',
          expires_at: 'x',
          token_type: 'Bearer',
        },
      })
    );

    const tokens = await auth.login({ email: 'a@b.com', password: 'pw' });

    expect(tokens.access_token).toBe('a');
    expect(await tokenStore.getAccessToken()).toBe('a');
  });

  it('logout clears local tokens even though it calls the server', async () => {
    await tokenStore.setTokens({
      access_token: 'a',
      refresh_token: 'r',
      expires_at: 'x',
      token_type: 'Bearer',
    });
    jest.spyOn(global, 'fetch').mockResolvedValue(okJson({}, 204));
    await auth.logout();
    expect(await tokenStore.getAccessToken()).toBeNull();
  });
});
