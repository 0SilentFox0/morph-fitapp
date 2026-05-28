/**
 * EXPO_PUBLIC_API_BASE_URL is read at build time by Metro from `.env` or
 * the shell environment. Falls back to the public wger.de instance.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://wger.de/api/v2';

export const API_TIMEOUT_MS = 10_000;
