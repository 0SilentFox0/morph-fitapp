import { request, ApiError, setUnauthorizedHandler } from '../../services/api/client';
import { tokenStore } from '../../services/api/tokenStore';
import { z } from 'zod';

const okJson = (body: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body } as Response);

beforeEach(async () => {
  await tokenStore.clear();
  jest.restoreAllMocks();
  setUnauthorizedHandler(() => {});
});

describe('api client', () => {
  it('sends the bearer token and returns parsed JSON', async () => {
    await tokenStore.setTokens({ access_token: 'tok', refresh_token: 'r', expires_at: 'x', token_type: 'Bearer' });
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(okJson({ data: { id: '1' } }));
    const res = await request('GET', '/me', { schema: z.object({ data: z.object({ id: z.string() }) }) });
    expect(res).toEqual({ data: { id: '1' } });
    const headers = (fetchSpy.mock.calls[0]![1] as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer tok');
  });

  it('appends query params, skipping null/undefined', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(okJson({ data: [] }));
    await request('GET', '/clients', { query: { status: 'active', q: undefined, per_page: 20 } });
    expect(fetchSpy.mock.calls[0]![0]).toContain('/clients?status=active&per_page=20');
  });

  it('throws ApiError with fieldErrors on 422', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      okJson({ message: 'Invalid', errors: { email: ['required'] } }, 422),
    );
    await expect(request('POST', '/clients', { body: {} })).rejects.toMatchObject({
      status: 422,
      fieldErrors: { email: ['required'] },
    });
  });

  it('refreshes once on 401 then retries the original request', async () => {
    await tokenStore.setTokens({ access_token: 'old', refresh_token: 'r', expires_at: 'x', token_type: 'Bearer' });
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(okJson({ message: 'Unauthenticated' }, 401)) // original
      .mockResolvedValueOnce(okJson({ data: { access_token: 'new', refresh_token: 'r2', expires_at: 'x', token_type: 'Bearer' } })) // refresh
      .mockResolvedValueOnce(okJson({ data: { id: '1' } })); // retry
    const res = await request('GET', '/me');
    expect(res).toEqual({ data: { id: '1' } });
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(await tokenStore.getAccessToken()).toBe('new');
  });

  it('clears tokens and notifies when refresh fails', async () => {
    await tokenStore.setTokens({ access_token: 'old', refresh_token: 'r', expires_at: 'x', token_type: 'Bearer' });
    const onUnauth = jest.fn();
    setUnauthorizedHandler(onUnauth);
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(okJson({ message: 'Unauthenticated' }, 401)) // original
      .mockResolvedValueOnce(okJson({ message: 'invalid refresh' }, 401)); // refresh fails
    await expect(request('GET', '/me')).rejects.toBeInstanceOf(ApiError);
    expect(onUnauth).toHaveBeenCalled();
    expect(await tokenStore.getAccessToken()).toBeNull();
  });

  it('does NOT clear tokens when the refresh request throws a network error', async () => {
    await tokenStore.setTokens({ access_token: 'old', refresh_token: 'r', expires_at: 'x', token_type: 'Bearer' });
    const onUnauth = jest.fn();
    setUnauthorizedHandler(onUnauth);
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(okJson({ message: 'Unauthenticated' }, 401)) // original
      .mockRejectedValueOnce(new Error('network down')); // refresh throws
    await expect(request('GET', '/me')).rejects.toThrow('network down');
    expect(onUnauth).not.toHaveBeenCalled();
    expect(await tokenStore.getAccessToken()).toBe('old'); // tokens preserved
  });

  it('does NOT clear tokens when the refresh endpoint returns 5xx (transient)', async () => {
    await tokenStore.setTokens({ access_token: 'old', refresh_token: 'r', expires_at: 'x', token_type: 'Bearer' });
    const onUnauth = jest.fn();
    setUnauthorizedHandler(onUnauth);
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(okJson({ message: 'Unauthenticated' }, 401)) // original request
      .mockResolvedValueOnce(okJson({ message: 'Service Unavailable' }, 503)); // refresh 5xx
    await expect(request('GET', '/me')).rejects.toBeInstanceOf(ApiError);
    expect(onUnauth).not.toHaveBeenCalled();
    expect(await tokenStore.getAccessToken()).toBe('old'); // token preserved
  });

  it('treats a malformed refresh response as a failed refresh (clears tokens)', async () => {
    await tokenStore.setTokens({ access_token: 'old', refresh_token: 'r', expires_at: 'x', token_type: 'Bearer' });
    const onUnauth = jest.fn();
    setUnauthorizedHandler(onUnauth);
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(okJson({ message: 'Unauthenticated' }, 401)) // original
      .mockResolvedValueOnce(okJson({ data: { nonsense: true } })); // refresh 200 but wrong shape
    await expect(request('GET', '/me')).rejects.toBeInstanceOf(ApiError);
    expect(onUnauth).toHaveBeenCalled();
    expect(await tokenStore.getAccessToken()).toBeNull();
  });
});
