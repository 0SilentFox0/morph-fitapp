import { create } from 'zustand';
import { useAppStore } from './appStore';
import { tokenStore } from '../services/api/tokenStore';
import { setUnauthorizedHandler } from '../services/api/client';
import * as authApi from '../services/api/auth';
import * as usersApi from '../services/api/users';
import type { User } from '../schemas/api/models';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

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
  useAppStore.getState().setUserRole(user.role);
  useAppStore.getState().setUserName(user.name);
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

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ status: 'unauthenticated', user: null });
    }
  },

  loadSession: async () => {
    await tokenStore.load();
    const token = await tokenStore.getAccessToken();
    if (!token) {
      set({ status: 'unauthenticated', user: null });
      return;
    }
    try {
      const { data } = await usersApi.getMe();
      syncRole(data);
      set({ status: 'authenticated', user: data });
    } catch {
      await tokenStore.clear();
      set({ status: 'unauthenticated', user: null });
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
