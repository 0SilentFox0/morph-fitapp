import { request, setConnectivityReporter } from '../../services/api/client';
import { tokenStore } from '../../services/api/tokenStore';

const okJson = (body: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body } as Response);

beforeEach(async () => {
  await tokenStore.clear();
  jest.restoreAllMocks();
});

afterEach(() => setConnectivityReporter(null));

describe('api client connectivity reporting', () => {
  it('reports reachable when any HTTP response comes back (even an error status)', async () => {
    const reports: boolean[] = [];
    setConnectivityReporter((online) => reports.push(online));
    jest.spyOn(global, 'fetch').mockResolvedValue(okJson({ message: 'boom' }, 500));

    await expect(request('GET', '/clients', { auth: false })).rejects.toBeTruthy();

    expect(reports).toContain(true);
    expect(reports).not.toContain(false);
  });

  it('reports unreachable when the fetch itself throws (network down)', async () => {
    const reports: boolean[] = [];
    setConnectivityReporter((online) => reports.push(online));
    jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Network request failed'));

    await expect(request('GET', '/clients', { auth: false })).rejects.toBeTruthy();

    expect(reports).toContain(false);
  });
});
