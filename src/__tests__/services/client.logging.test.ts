import { request } from '../../services/api/client';
import { tokenStore } from '../../services/api/tokenStore';
import { type LogEvent, setLogSink } from '../../services/logger';

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

afterEach(() => setLogSink(null));

describe('api client request logging', () => {
  it('logs an error for a 5xx response with status, method and path', async () => {
    const events: LogEvent[] = [];

    setLogSink((e) => events.push(e));
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(okJson({ message: 'boom' }, 500));

    await expect(
      request('GET', '/clients', { auth: false })
    ).rejects.toBeTruthy();

    const errors = events.filter((e) => e.level === 'error');

    expect(errors).toHaveLength(1);
    expect(errors[0]!.context).toMatchObject({
      status: 500,
      method: 'GET',
      path: '/clients',
    });
  });

  it('logs a warning (not error) for a 4xx response', async () => {
    const events: LogEvent[] = [];

    setLogSink((e) => events.push(e));
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(okJson({ message: 'nope' }, 404));

    await expect(
      request('GET', '/missing', { auth: false })
    ).rejects.toBeTruthy();

    expect(events.some((e) => e.level === 'warn')).toBe(true);
    expect(events.some((e) => e.level === 'error')).toBe(false);
  });

  it('never includes the bearer token in the logged context', async () => {
    await tokenStore.setTokens({
      access_token: 'super-secret-token',
      refresh_token: 'r',
      expires_at: 'x',
      token_type: 'Bearer',
    });

    const events: LogEvent[] = [];

    setLogSink((e) => events.push(e));
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(okJson({ message: 'boom' }, 500));

    await expect(request('GET', '/me')).rejects.toBeTruthy();

    const serialized = JSON.stringify(events);

    expect(serialized).not.toContain('super-secret-token');
  });

  it('does NOT log when a request succeeds', async () => {
    const events: LogEvent[] = [];

    setLogSink((e) => events.push(e));
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(okJson({ data: { id: '1' } }));

    await request('GET', '/clients', { auth: false });

    expect(events).toHaveLength(0);
  });
});
