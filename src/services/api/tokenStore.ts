import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TokenResponse } from '../../schemas/api/models';

const STORAGE_KEY = 'fitconnect.tokens';

let cache: TokenResponse | null = null;

/**
 * Persists Sanctum access/refresh tokens. In-memory cache is the source of
 * truth at runtime; AsyncStorage survives app restarts. `load()` hydrates the
 * cache once on startup.
 */
export const tokenStore = {
  async load(): Promise<void> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as TokenResponse) : null;
  },

  async setTokens(tokens: TokenResponse): Promise<void> {
    cache = tokens;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  },

  async getAccessToken(): Promise<string | null> {
    if (cache) return cache.access_token;
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    cache = JSON.parse(raw) as TokenResponse;
    return cache.access_token;
  },

  async getRefreshToken(): Promise<string | null> {
    if (cache) return cache.refresh_token;
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    cache = JSON.parse(raw) as TokenResponse;
    return cache.refresh_token;
  },

  async clear(): Promise<void> {
    cache = null;
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
