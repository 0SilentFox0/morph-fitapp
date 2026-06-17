import { dataEnvelope } from '../../schemas/api/envelope';
import { UserPublicSchema, UserSchema } from '../../schemas/api/models';
import { api } from './client';

export interface UpdateProfileInput {
  name?: string;
  experience?: string;
  certifications?: string[];
  training_types?: string[];
  client_types?: string[];
  locations?: string[];
  work_schedule_start?: string;
  work_schedule_end?: string;
  work_schedule_days?: string[];
  goals?: string[];
  fitness_level?: string;
}

export const getMe = () => api.get('/me', { schema: dataEnvelope(UserSchema) });

export const updateMe = (body: UpdateProfileInput) =>
  api.put('/me', { body, schema: dataEnvelope(UserSchema) });

export const updateAvatar = (media_file_id: string) =>
  api.put('/me/avatar', {
    body: { media_file_id },
    schema: dataEnvelope(UserSchema),
  });

export const getOnboarding = () => api.get('/me/onboarding');

export const updateOnboardingStep = (
  step: string,
  data: Record<string, unknown>
) => api.put(`/me/onboarding/${step}`, { body: { data } });

/**
 * Mark onboarding complete server-side. Sets `users.onboarding_completed_at`,
 * which `authStore.syncUser()` reads to keep `isOnboarded` backend-authoritative
 * across sessions/devices. Returns the updated user.
 */
export const completeOnboarding = () =>
  api.post('/me/onboarding/complete', { schema: dataEnvelope(UserSchema) });

export const updateSettings = (body: {
  timezone?: string;
  locale?: string;
  currency?: string;
  notification_preferences?: Record<string, unknown>;
}) => api.put('/me/settings', { body, schema: dataEnvelope(UserSchema) });

export const getUser = (id: string) =>
  api.get(`/users/${id}`, { schema: dataEnvelope(UserPublicSchema) });
