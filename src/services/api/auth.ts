import { dataEnvelope } from '../../schemas/api/envelope';
import {
  type TokenResponse,
  TokenResponseSchema,
} from '../../schemas/api/models';
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
