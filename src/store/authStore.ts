import { create } from 'zustand';

import { apiReadiness } from '../config/apiReadiness';
import type { User } from '../schemas/api/models';
import * as authApi from '../services/api/auth';
import { ApiError, setUnauthorizedHandler } from '../services/api/client';
import { tokenStore } from '../services/api/tokenStore';
import * as usersApi from '../services/api/users';
import { getGoogleIdToken } from '../services/auth/googleAuth';
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
  loginWithGoogle: (role?: 'client' | 'trainer') => Promise<void>;
  /**
   * DEV ONLY: drop into the app as a ready-made, onboarded test user without a
   * backend account. API-backed screens will show empty/error states (no token),
   * but mock-fallback screens work — enough to navigate the UI while testing.
   */
  loginAsTestUser: (role?: 'client' | 'trainer') => void;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  loadSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * Mirror the authenticated user into appStore so navigation reacts. Onboarding
 * is backend-authoritative once completed: if the server reports
 * `onboarding_completed_at`, mark the user onboarded so returning users skip the
 * flow. We do NOT force it back to false when null, because completion is not
 * yet persisted to the backend (the `/me/onboarding/complete` endpoint isn't
 * deployed) — that would re-onboard users who finished locally.
 */
function syncUser(user: User): void {
  useAppStore.setState({ userRole: user.role, userName: user.name });

  if (user.onboarding_completed_at) {
    useAppStore.setState({ isOnboarded: true });
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,

  login: async (email, password) => {
    await authApi.login({ email, password });

    const { data } = await usersApi.getMe();

    syncUser(data);
    set({ status: 'authenticated', user: data });
  },

  register: async (input) => {
    await authApi.register(input);

    const { data } = await usersApi.getMe();

    syncUser(data);
    set({ status: 'authenticated', user: data });
  },

  loginWithGoogle: async (role) => {
    const idToken = await getGoogleIdToken();

    await authApi.loginWithGoogle({ id_token: idToken, role });

    // Live mode: the real /me reflects the Google-linked account. Mock mode: the
    // dev token can't satisfy /me, so synthesize a navigable local user instead
    // of faking a success screen over a broken session.
    if (apiReadiness.google) {
      const { data } = await usersApi.getMe();

      syncUser(data);
      set({ status: 'authenticated', user: data });

      return;
    }

    const mockUser: User = {
      id: 'mock-google-user',
      email: 'google.user@example.com',
      name: 'Google User',
      role: role ?? 'client',
      certifications: [],
      training_types: [],
      client_types: [],
      locations: [],
      work_schedule_days: [],
      goals: [],
      created_at: new Date().toISOString(),
    };

    syncUser(mockUser);
    set({ status: 'authenticated', user: mockUser });
  },

  loginAsTestUser: (role = 'client') => {
    const testUser: User = {
      id: 'dev-test-user',
      email: 'test@fitconnect.dev',
      name: role === 'trainer' ? 'Test Trainer' : 'Test Client',
      role,
      certifications: [],
      training_types: [],
      client_types: [],
      locations: [],
      work_schedule_days: [],
      goals: [],
      created_at: new Date().toISOString(),
    };

    syncUser(testUser);
    // Skip onboarding and land straight in the app for testing.
    useAppStore.setState({ isOnboarded: true, signupMode: false });
    set({ status: 'authenticated', user: testUser });
  },

  // NOTE (follow-up): we still do NOT call useAppStore.reset() here. loadSession
  // now derives isOnboarded from the backend's onboarding_completed_at, but only
  // when it is set true — completion isn't persisted to the backend yet (the
  // /me/onboarding/complete endpoint isn't deployed). Until it is, resetting on
  // logout would force locally-onboarded users to re-onboard. Enable the reset
  // once completion writes onboarding_completed_at server-side.
  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      // Clear any in-progress signup so logout always lands on the login screen.
      useAppStore.setState({ signupMode: false });
      set({ status: 'unauthenticated', user: null });
    }
  },

  deleteAccount: async () => {
    try {
      await authApi.deleteAccount();
    } finally {
      // Always drop the local session, even if the request fails — the user
      // asked to leave; clear token so they land back on login.
      await tokenStore.clear();
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

      syncUser(data);
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

    syncUser(data);
    set({ user: data });
  },
}));

// A failed token refresh inside the client forces an immediate logout.
setUnauthorizedHandler(() => {
  useAuthStore.setState({ status: 'unauthenticated', user: null });
});
