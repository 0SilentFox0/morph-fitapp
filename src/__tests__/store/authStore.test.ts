import { act } from '@testing-library/react-native';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { tokenStore } from '../../services/api/tokenStore';
import * as authApi from '../../services/api/auth';
import * as usersApi from '../../services/api/users';

const user = { id: 'u1', email: 'a@b.com', name: 'Jane', role: 'trainer', created_at: 'x', certifications: [], training_types: [], client_types: [], locations: [], work_schedule_days: [], goals: [] };

beforeEach(async () => {
  await tokenStore.clear();
  useAuthStore.setState({ status: 'loading', user: null });
  jest.restoreAllMocks();
});

describe('authStore', () => {
  it('login fetches the profile and marks authenticated + syncs role', async () => {
    jest.spyOn(authApi, 'login').mockResolvedValue({ access_token: 'a', refresh_token: 'r', expires_at: 'x', token_type: 'Bearer' });
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
});
