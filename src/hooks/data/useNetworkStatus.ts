import { useConnectivityStore } from '../../store/connectivityStore';

/**
 * Reachability of the backend, derived from recent request outcomes.
 * Returns `false` once a request fails at the network level, `true` again as
 * soon as any HTTP response is received.
 */
export function useNetworkStatus(): boolean {
  return useConnectivityStore((s) => s.online);
}
