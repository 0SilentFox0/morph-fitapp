import { apiReadiness } from '../../config/apiReadiness';
import { dataEnvelope } from '../../schemas/api/envelope';
import {
  type TokenResponse,
  TokenResponseSchema,
} from '../../schemas/api/models';
import { withMockFallback } from '../mockFallback';
import { api, request } from './client';
import { tokenStore } from './tokenStore';

const tokenEnvelope = dataEnvelope(TokenResponseSchema);

export interface LoginInput {
  email: string;
  password: string;
  device_label?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'client' | 'trainer';
}

export async function login(input: LoginInput): Promise<TokenResponse> {
  const { data } = await request('POST', '/auth/login', {
    body: input,
    auth: false,
    schema: tokenEnvelope,
  });

  await tokenStore.setTokens(data);

  return data;
}

export async function register(input: RegisterInput): Promise<TokenResponse> {
  const { data } = await request('POST', '/auth/register', {
    body: input,
    auth: false,
    schema: tokenEnvelope,
  });

  await tokenStore.setTokens(data);

  return data;
}

export interface GoogleLoginInput {
  /** Google-issued OIDC id_token obtained on-device (see services/auth/googleAuth.ts). */
  id_token: string;
  /** Role to assign on first sign-up via Google. Ignored for returning users. */
  role?: 'client' | 'trainer';
}

/**
 * Exchange a Google id_token for our Sanctum tokens. Lives behind
 * `apiReadiness.google`: until the backend ships `POST /auth/google`, the mock
 * path returns a dev token so the flow stays navigable in development. The
 * caller (authStore) synthesizes a local user in mock mode — see loginWithGoogle.
 */
export async function loginWithGoogle(
  input: GoogleLoginInput
): Promise<TokenResponse> {
  const data = await withMockFallback(
    apiReadiness.google,
    async () => {
      const res = await request('POST', '/auth/google', {
        body: input,
        auth: false,
        schema: tokenEnvelope,
      });

      return res.data;
    },
    (): TokenResponse => ({
      access_token: 'mock-google-access-token',
      refresh_token: 'mock-google-refresh-token',
      expires_at: new Date(Date.now() + 3600_000).toISOString(),
      token_type: 'Bearer',
    })
  );

  await tokenStore.setTokens(data);

  return data;
}

/**
 * Link a Google account to the signed-in user (so they can later sign in with
 * Google). Gated by `apiReadiness.google`; the mock path is a no-op until the
 * backend ships `POST /me/auth/google`.
 */
export async function linkGoogle(idToken: string): Promise<void> {
  await withMockFallback(
    apiReadiness.google,
    async () => {
      await api.post('/me/auth/google', { body: { id_token: idToken } });
    },
    () => undefined
  );
}

export async function logout(): Promise<void> {
  try {
    // skipRefresh: an expired token shouldn't trigger a refresh cascade on the way out.
    await api.post('/auth/logout', { skipRefresh: true });
  } finally {
    await tokenStore.clear();
  }
}

export async function logoutAll(): Promise<void> {
  try {
    await api.post('/auth/logout-all', { skipRefresh: true });
  } finally {
    await tokenStore.clear();
  }
}

export const forgotPassword = (email: string) =>
  api.post('/auth/forgot-password', { body: { email }, auth: false });

export const resetPassword = (body: {
  token: string;
  password: string;
  password_confirmation: string;
}) => api.post('/auth/reset-password', { body, auth: false });

export const verifyEmail = (token: string) =>
  api.post('/auth/verify-email', { body: { token }, auth: false });

export const confirmEmailChange = (token: string) =>
  api.post('/auth/confirm-email-change', { body: { token }, auth: false });

export const changeEmail = (body: { new_email: string; password: string }) =>
  api.post('/auth/change-email', { body });

export const deleteAccount = () => api.delete('/auth/me/account');
