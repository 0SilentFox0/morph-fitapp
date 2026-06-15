import { useConnectivityStore } from '../../store/connectivityStore';
import { request } from '../../services/api/client';
import { tokenStore } from '../../services/api/tokenStore';

const okJson = (body: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body } as Response);

beforeEach(async () => {
  await tokenStore.clear();
  jest.restoreAllMocks();
  useConnectivityStore.setState({ online: true });
});

describe('connectivityStore', () => {
  it('defaults to online', () => {
    expect(useConnectivityStore.getState().online).toBe(true);
  });

  it('flips offline when a request fails at the network level', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Network request failed'));
    await expect(request('GET', '/clients', { auth: false })).rejects.toBeTruthy();
    expect(useConnectivityStore.getState().online).toBe(false);
  });

  it('flips back online on a successful response', async () => {
    useConnectivityStore.setState({ online: false });
    jest.spyOn(global, 'fetch').mockResolvedValue(okJson({ data: [] }));
    await request('GET', '/clients', { auth: false });
    expect(useConnectivityStore.getState().online).toBe(true);
  });
});
