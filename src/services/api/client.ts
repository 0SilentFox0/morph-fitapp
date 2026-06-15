import { API_BASE_URL, API_TIMEOUT_MS } from '../../config/env';
import { tokenStore } from './tokenStore';
import type { z } from 'zod';
import { dataEnvelope } from '../../schemas/api/envelope';
import { TokenResponseSchema } from '../../schemas/api/models';

const refreshEnvelope = dataEnvelope(TokenResponseSchema);

/** Error thrown for any non-2xx response. `fieldErrors` is populated on 422. */
export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string[]>;
  constructor(status: number, message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type QueryValue = string | number | boolean | undefined | null;
export type Query = Record<string, QueryValue>;

export interface RequestOptions<T> {
  body?: unknown;
  query?: Query;
  schema?: z.ZodType<T>;
  /** Attach the bearer token. Default true; set false for public auth endpoints. */
  auth?: boolean;
}

/** authStore registers a handler so a failed refresh can force a logout. */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  onUnauthorized = fn;
}

function buildUrl(path: string, query?: Query): string {
  if (!query) return `${API_BASE_URL}${path}`;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${API_BASE_URL}${path}?${qs}` : `${API_BASE_URL}${path}`;
}

async function rawRequest(
  method: HttpMethod,
  path: string,
  opts: { body?: unknown; query?: Query; auth: boolean },
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
    if (opts.auth) {
      const token = await tokenStore.getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    return await fetch(buildUrl(path, opts.query), {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  let payload: { message?: string; errors?: Record<string, string[]> } | undefined;
  try {
    payload = await res.json();
  } catch {
    /* non-JSON error body */
  }
  if (res.status === 422 && payload?.errors) {
    return new ApiError(422, payload.message ?? 'Validation failed', payload.errors);
  }
  return new ApiError(res.status, payload?.message ?? `Request failed (${res.status}).`);
}

/** Single-flight refresh: concurrent 401s await the same refresh call. */
let refreshPromise: Promise<boolean> | null = null;
async function ensureRefreshed(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refresh_token = await tokenStore.getRefreshToken();
      if (!refresh_token) return false;
      const res = await rawRequest('POST', '/auth/refresh', { body: { refresh_token }, auth: false });
      if (res.status === 401 || res.status === 403) return false; // refresh token definitively rejected
      if (!res.ok) {
        // Transient failure (5xx / unexpected) — do NOT treat as logout; let it propagate.
        throw new ApiError(res.status, 'Token refresh failed; please retry.');
      }
      const json = await res.json();
      const parsed = refreshEnvelope.safeParse(json);
      if (!parsed.success) return false; // unexpected 2xx shape — failed refresh
      await tokenStore.setTokens(parsed.data.data);
      return true;
    })();
    refreshPromise = refreshPromise.finally(() => {
      refreshPromise = null;
    }) as Promise<boolean>;
  }
  return refreshPromise;
}

/** Make a typed request against the backend. */
export async function request<T = unknown>(
  method: HttpMethod,
  path: string,
  opts: RequestOptions<T> = {},
): Promise<T> {
  const auth = opts.auth !== false;
  let res = await rawRequest(method, path, { body: opts.body, query: opts.query, auth });

  if (res.status === 401 && auth) {
    // ensureRefreshed() may throw on transient errors (network failure, timeout).
    // Only clear tokens / notify on a definitive refresh failure (returns false).
    const refreshed = await ensureRefreshed();
    if (refreshed) {
      res = await rawRequest(method, path, { body: opts.body, query: opts.query, auth });
    } else {
      await tokenStore.clear();
      onUnauthorized?.();
      throw await toApiError(res);
    }
  }

  if (!res.ok) {
    if (res.status === 401 && auth) {
      await tokenStore.clear();
      onUnauthorized?.();
    }
    throw await toApiError(res);
  }

  if (res.status === 204) return undefined as T;

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, 'The server returned a malformed response.');
  }

  if (opts.schema) {
    const parsed = opts.schema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(res.status, 'Received an unexpected response from the server.');
    }
    return parsed.data;
  }
  return json as T;
}

/** Convenience helpers. */
export const api = {
  get: <T>(path: string, opts?: RequestOptions<T>) => request<T>('GET', path, opts),
  post: <T>(path: string, opts?: RequestOptions<T>) => request<T>('POST', path, opts),
  put: <T>(path: string, opts?: RequestOptions<T>) => request<T>('PUT', path, opts),
  patch: <T>(path: string, opts?: RequestOptions<T>) => request<T>('PATCH', path, opts),
  delete: <T>(path: string, opts?: RequestOptions<T>) => request<T>('DELETE', path, opts),
};
