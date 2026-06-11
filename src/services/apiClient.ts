import { API_BASE_URL, API_TIMEOUT_MS } from '../config/env';

/**
 * Wraps fetch with a configurable timeout and JSON parsing.
 * Throws on non-2xx responses. Callers handle errors in try/catch.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
      throw new Error(`API ${res.status}: ${res.statusText || 'Request failed'}`);
    }
    try {
      return (await res.json()) as T;
    } catch {
      throw new Error('The server returned a malformed response.');
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
