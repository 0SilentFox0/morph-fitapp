import { request } from '../../services/api/client';
import { tokenStore } from '../../services/api/tokenStore';

const okJson = (body: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body } as Response);

const headersOf = (call: unknown[]) =>
  (call[1] as RequestInit).headers as Record<string, string>;

beforeEach(async () => {
  await tokenStore.clear();
  jest.restoreAllMocks();
});

describe('api client idempotency key', () => {
  it('attaches an Idempotency-Key header to POST requests', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(okJson({ data: { id: '1' } }));
    await request('POST', '/sessions', { body: { title: 'x' }, auth: false });
    expect(headersOf(fetchSpy.mock.calls[0]!)['Idempotency-Key']).toBeTruthy();
  });

  it('does NOT attach an Idempotency-Key header to GET requests', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(okJson({ data: [] }));
    await request('GET', '/sessions', { auth: false });
    expect(headersOf(fetchSpy.mock.calls[0]!)['Idempotency-Key']).toBeUndefined();
  });

  it('reuses the same Idempotency-Key when a POST is retried after a token refresh', async () => {
    await tokenStore.setTokens({ access_token: 'old', refresh_token: 'r', expires_at: 'x', token_type: 'Bearer' });
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(okJson({ message: 'Unauthenticated' }, 401)) // original POST
      .mockResolvedValueOnce(okJson({ data: { access_token: 'new', refresh_token: 'r2', expires_at: 'x', token_type: 'Bearer' } })) // refresh
      .mockResolvedValueOnce(okJson({ data: { id: '1' } })); // retried POST

    await request('POST', '/sessions', { body: { title: 'x' } });

    const originalKey = headersOf(fetchSpy.mock.calls[0]!)['Idempotency-Key'];
    const retryKey = headersOf(fetchSpy.mock.calls[2]!)['Idempotency-Key'];
    expect(originalKey).toBeTruthy();
    expect(retryKey).toBe(originalKey);
    // The internal refresh call must not carry the caller's idempotency key.
    expect(headersOf(fetchSpy.mock.calls[1]!)['Idempotency-Key']).toBeUndefined();
  });
});
