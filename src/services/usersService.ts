import { apiReadiness } from '../config/apiReadiness';
import type { User } from '../schemas/api/models';
import type { UpdateProfileInput } from './api/users';
import * as usersApi from './api/users';
import { withMockFallback } from './mockFallback';

/** Raw values from the Edit Profile form. */
export interface ProfileFormValues {
  name: string;
  experience?: string;
  trainingTypes?: string[];
  clientTypes?: string[];
  locations?: string[];
}

/** Pure, validated adapter: form values → backend `UpdateProfileInput`. */
export function buildProfileInput(form: ProfileFormValues): UpdateProfileInput {
  const name = form.name.trim();

  if (!name) throw new Error('Name is required');

  return {
    name,
    ...(form.experience?.trim() ? { experience: form.experience.trim() } : {}),
    ...(form.trainingTypes ? { training_types: form.trainingTypes } : {}),
    ...(form.clientTypes ? { client_types: form.clientTypes } : {}),
    ...(form.locations ? { locations: form.locations } : {}),
  };
}

/** Persist a profile edit. Lives behind the `users` readiness flag. */
export async function updateProfile(form: ProfileFormValues): Promise<User> {
  const input = buildProfileInput(form);

  return withMockFallback(
    apiReadiness.users,
    async () => (await usersApi.updateMe(input)).data,
    () => ({ name: input.name }) as User
  );
}
