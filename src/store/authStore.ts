import { create } from 'zustand';

import type { User } from '../schemas/api/models';
import * as authApi from '../services/api/auth';
import { ApiError, setUnauthorizedHandler } from '../services/api/client';
import { tokenStore } from '../services/api/tokenStore';
import * as usersApi from '../services/api/users';
import { useAppStore } from './appStore';

export type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  /** A token exists but the backend was unreachable on cold start — show a retry screen, not login. */
  | 'offline';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: authApi.RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/** Mirror the authenticated user's role into appStore so navigation reacts. */
function syncRole(user: User): void {
  useAppStore.setState({ userRole: user.role, userName: user.name });
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,

  login: async (email, password) => {
    await authApi.login({ email, password });

    const { data } = await usersApi.getMe();

    syncRole(data);
    set({ status: 'authenticated', user: data });
  },

  register: async (input) => {
    await authApi.register(input);

    const { data } = await usersApi.getMe();

    syncRole(data);
    set({ status: 'authenticated', user: data });
  },

  // NOTE (follow-up): we intentionally do NOT call useAppStore.reset() here yet.
  // Onboarding completion is still local-only (mock), not backend-persisted, so
  // resetting isOnboarded would force completed users to re-onboard on every login.
  // Multi-user-same-device cleanup belongs with backend-driven onboarding
  // (user.onboarding_completed_at), which is a deferred task.
  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ status: 'unauthenticated', user: null });
    }
  },

  loadSession: async () => {
    try {
      await tokenStore.load();

      const token = await tokenStore.getAccessToken();

      if (!token) {
        set({ status: 'unauthenticated', user: null });

        return;
      }

      const { data } = await usersApi.getMe();

      syncRole(data);
      set({ status: 'authenticated', user: data });
    } catch (err) {
      // Only a definitive 401 means the token is invalid — clear it and send the
      // user to login. Transient failures (network/timeout/5xx) must NOT destroy a
      // possibly-valid session: keep the token and surface a retryable offline state.
      if (err instanceof ApiError && err.status === 401) {
        await tokenStore.clear();
        set({ status: 'unauthenticated', user: null });
      } else {
        set({ status: 'offline', user: null });
      }
    }
  },

  refreshProfile: async () => {
    const { data } = await usersApi.getMe();

    syncRole(data);
    set({ user: data });
  },
}));

// A failed token refresh inside the client forces an immediate logout.
setUnauthorizedHandler(() => {
  useAuthStore.setState({ status: 'unauthenticated', user: null });
});
