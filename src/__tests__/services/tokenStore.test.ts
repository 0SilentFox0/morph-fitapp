import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenStore } from '../../services/api/tokenStore';

beforeEach(async () => {
  await AsyncStorage.clear();
  await tokenStore.clear();
});

describe('tokenStore', () => {
  it('returns null tokens when empty', async () => {
    expect(await tokenStore.getAccessToken()).toBeNull();
    expect(await tokenStore.getRefreshToken()).toBeNull();
  });

  it('persists and reads back tokens', async () => {
    await tokenStore.setTokens({ access_token: 'a', refresh_token: 'r', expires_at: 'x', token_type: 'Bearer' });
    expect(await tokenStore.getAccessToken()).toBe('a');
    expect(await tokenStore.getRefreshToken()).toBe('r');
  });

  it('hydrates the in-memory cache from storage via load()', async () => {
    await AsyncStorage.setItem(
      'fitconnect.tokens',
      JSON.stringify({ access_token: 'a2', refresh_token: 'r2', expires_at: 'x', token_type: 'Bearer' }),
    );
    await tokenStore.load();
    expect(await tokenStore.getAccessToken()).toBe('a2');
  });

  it('clear() wipes memory and storage', async () => {
    await tokenStore.setTokens({ access_token: 'a', refresh_token: 'r', expires_at: 'x', token_type: 'Bearer' });
    await tokenStore.clear();
    expect(await tokenStore.getAccessToken()).toBeNull();
    expect(await AsyncStorage.getItem('fitconnect.tokens')).toBeNull();
  });
});
