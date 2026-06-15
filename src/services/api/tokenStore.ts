import AsyncStorage from '@react-native-async-storage/async-storage';

import type { TokenResponse } from '../../schemas/api/models';

const STORAGE_KEY = 'fitconnect.tokens';

let cache: TokenResponse | null = null;

async function readCache(): Promise<TokenResponse | null> {
  if (cache) return cache;

  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  cache = raw ? (JSON.parse(raw) as TokenResponse) : null;

  return cache;
}

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
    return (await readCache())?.access_token ?? null;
  },

  async getRefreshToken(): Promise<string | null> {
    return (await readCache())?.refresh_token ?? null;
  },

  async clear(): Promise<void> {
    cache = null;
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
