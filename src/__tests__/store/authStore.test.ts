import { act } from '@testing-library/react-native';

import * as authApi from '../../services/api/auth';
import { ApiError } from '../../services/api/client';
import { tokenStore } from '../../services/api/tokenStore';
import * as usersApi from '../../services/api/users';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';

const user = {
  id: 'u1',
  email: 'a@b.com',
  name: 'Jane',
  role: 'trainer',
  created_at: 'x',
  certifications: [],
  training_types: [],
  client_types: [],
  locations: [],
  work_schedule_days: [],
  goals: [],
};

beforeEach(async () => {
  await tokenStore.clear();
  useAuthStore.setState({ status: 'loading', user: null });
  jest.restoreAllMocks();
});

describe('authStore', () => {
  it('login fetches the profile and marks authenticated + syncs role', async () => {
    jest.spyOn(authApi, 'login').mockResolvedValue({
      access_token: 'a',
      refresh_token: 'r',
      expires_at: 'x',
      token_type: 'Bearer',
    });
    jest.spyOn(usersApi, 'getMe').mockResolvedValue({ data: user } as never);
    await act(async () => {
      await useAuthStore.getState().login('a@b.com', 'pw');
    });
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().user?.name).toBe('Jane');
    expect(useAppStore.getState().userRole).toBe('trainer');
  });

  it('loadSession with no token becomes unauthenticated', async () => {
    await act(async () => {
      await useAuthStore.getState().loadSession();
    });
    expect(useAuthStore.getState().status).toBe('unauthenticated');
  });

  it('logout clears the user', async () => {
    jest.spyOn(authApi, 'logout').mockResolvedValue();
    useAuthStore.setState({ status: 'authenticated', user: user as never });
    await act(async () => {
      await useAuthStore.getState().logout();
    });
    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('deleteAccount calls the API, clears the token and logs out', async () => {
    const spy = jest
      .spyOn(authApi, 'deleteAccount')
      .mockResolvedValue(undefined as never);

    await tokenStore.setTokens({
      access_token: 'a',
      refresh_token: 'r',
      expires_at: 'x',
      token_type: 'Bearer',
    });
    useAuthStore.setState({ status: 'authenticated', user: user as never });

    await act(async () => {
      await useAuthStore.getState().deleteAccount();
    });

    expect(spy).toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(useAuthStore.getState().user).toBeNull();
    expect(await tokenStore.getAccessToken()).toBeNull();
  });

  it('loadSession becomes offline (not unauthenticated) and preserves token on a transient error', async () => {
    await tokenStore.setTokens({
      access_token: 'a',
      refresh_token: 'r',
      expires_at: 'x',
      token_type: 'Bearer',
    });
    jest.spyOn(usersApi, 'getMe').mockRejectedValue(new Error('network down'));
    await act(async () => {
      await useAuthStore.getState().loadSession();
    });
    expect(useAuthStore.getState().status).toBe('offline');
    expect(await tokenStore.getAccessToken()).toBe('a'); // token preserved
  });

  it('a transient 5xx is treated as offline (token preserved)', async () => {
    await tokenStore.setTokens({
      access_token: 'a',
      refresh_token: 'r',
      expires_at: 'x',
      token_type: 'Bearer',
    });
    jest
      .spyOn(usersApi, 'getMe')
      .mockRejectedValue(new ApiError(503, 'Service Unavailable'));
    await act(async () => {
      await useAuthStore.getState().loadSession();
    });
    expect(useAuthStore.getState().status).toBe('offline');
    expect(await tokenStore.getAccessToken()).toBe('a');
  });

  it('retrying loadSession from offline reaches authenticated when the server recovers', async () => {
    await tokenStore.setTokens({
      access_token: 'a',
      refresh_token: 'r',
      expires_at: 'x',
      token_type: 'Bearer',
    });
    useAuthStore.setState({ status: 'offline', user: null });
    jest.spyOn(usersApi, 'getMe').mockResolvedValue({ data: user } as never);
    await act(async () => {
      await useAuthStore.getState().loadSession();
    });
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().user?.name).toBe('Jane');
  });

  it('marks isOnboarded when the backend reports onboarding completed', async () => {
    await tokenStore.setTokens({
      access_token: 'a',
      refresh_token: 'r',
      expires_at: 'x',
      token_type: 'Bearer',
    });
    useAppStore.setState({ isOnboarded: false });
    jest.spyOn(usersApi, 'getMe').mockResolvedValue({
      data: { ...user, onboarding_completed_at: '2026-01-01T00:00:00Z' },
    } as never);
    await act(async () => {
      await useAuthStore.getState().loadSession();
    });
    expect(useAppStore.getState().isOnboarded).toBe(true);
  });

  it('does not reset local isOnboarded when backend onboarding is null (flow not yet persisted)', async () => {
    await tokenStore.setTokens({
      access_token: 'a',
      refresh_token: 'r',
      expires_at: 'x',
      token_type: 'Bearer',
    });
    useAppStore.setState({ isOnboarded: true });
    jest
      .spyOn(usersApi, 'getMe')
      .mockResolvedValue({ data: { ...user, onboarding_completed_at: null } } as never);
    await act(async () => {
      await useAuthStore.getState().loadSession();
    });
    expect(useAppStore.getState().isOnboarded).toBe(true);
  });

  it('loadSession clears token on a 401', async () => {
    await tokenStore.setTokens({
      access_token: 'a',
      refresh_token: 'r',
      expires_at: 'x',
      token_type: 'Bearer',
    });
    jest
      .spyOn(usersApi, 'getMe')
      .mockRejectedValue(new ApiError(401, 'Unauthenticated'));
    await act(async () => {
      await useAuthStore.getState().loadSession();
    });
    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(await tokenStore.getAccessToken()).toBeNull(); // token cleared
  });
});
