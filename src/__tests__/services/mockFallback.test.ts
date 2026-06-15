import { withMockFallback } from '../../services/mockFallback';

describe('withMockFallback', () => {
  it('returns the mock and never calls live when the endpoint is not ready', async () => {
    const live = jest.fn(() => Promise.resolve('live'));
    const result = await withMockFallback(false, live, () => 'mock');
    expect(result).toBe('mock');
    expect(live).not.toHaveBeenCalled();
  });

  it('calls live and returns its result when the endpoint is ready', async () => {
    const result = await withMockFallback(true, () => Promise.resolve('live'), () => 'mock');
    expect(result).toBe('live');
  });

  it('propagates live errors when ready (does NOT silently fall back to mock)', async () => {
    await expect(
      withMockFallback(true, () => Promise.reject(new Error('boom')), () => 'mock'),
    ).rejects.toThrow('boom');
  });
});
