import { create } from 'zustand';
import { setConnectivityReporter } from '../services/api/client';

interface ConnectivityState {
  /** Whether the backend was reachable on the most recent request. */
  online: boolean;
  setOnline: (online: boolean) => void;
}

export const useConnectivityStore = create<ConnectivityState>((set) => ({
  online: true,
  setOnline: (online) => set((s) => (s.online === online ? s : { online })),
}));

// Bridge the API client's reachability signal into the store. Reachability is
// derived from request outcomes (see setConnectivityReporter in the client).
setConnectivityReporter((online) => {
  useConnectivityStore.getState().setOnline(online);
});
