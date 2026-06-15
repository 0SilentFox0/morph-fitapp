/**
 * Run `live` only when the backing endpoint is `ready`; otherwise return `mock`.
 *
 * Errors from a ready `live` call are NOT swallowed — they propagate so the UI
 * can show its error/retry state. The mock is only ever used as a stand-in for
 * an endpoint that doesn't exist yet, never to paper over a real failure.
 */
export async function withMockFallback<T>(
  ready: boolean,
  live: () => Promise<T>,
  mock: () => T | Promise<T>,
): Promise<T> {
  return ready ? live() : mock();
}
