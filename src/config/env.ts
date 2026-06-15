/**
 * EXPO_PUBLIC_* vars are read at build time by Metro from `.env` or the shell.
 *
 * API_BASE_URL  → FitConnect backend (Laravel/Sanctum), used by src/services/api.
 * WGER_API_BASE_URL → legacy public exercise catalogue, used by src/services/apiClient.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://morph-server.desmait.tech/api/v1';

export const WGER_API_BASE_URL =
  process.env.EXPO_PUBLIC_WGER_API_BASE_URL ?? 'https://wger.de/api/v2';

// 15s: the FitConnect backend can be slower to respond than the legacy wger API.
export const API_TIMEOUT_MS = 15_000;
