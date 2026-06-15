import { apiReadiness } from '../config/apiReadiness';
import type { UserRole } from '../store/appStore';
import type { OnboardingState } from '../store/onboardingStore';
import type { UpdateProfileInput } from './api/users';
import * as usersApi from './api/users';
import { logger } from './logger';
import { withMockFallback } from './mockFallback';

/**
 * Consolidated profiles the backend receives at the end of onboarding. These
 * are the API contract: the scattered onboarding-store fields are mapped into
 * one object with meaningful names so the (future PHP) backend gets a clean
 * payload it can match a client to a trainer with.
 */
export interface ClientProfile {
  role: 'client';
  name: string;
  /** How long the client has been training (mirrors the trainer "experience"). */
  trainingDuration: string;
  /** Self-classification: Beginner / Amateur / Advanced / Professional. */
  level: string;
  /** Training types the client is interested in. */
  interests: string[];
  injuries: { has: boolean; note: string };
  preferredLocations: string[];
  availability: { days: string[]; from: string; to: string };
  trainerPreferences: { gender: string; formats: string[] };
  photoUri: string | null;
}

export interface TrainerProfile {
  role: 'trainer';
  name: string;
  experience: string;
  certifications: { has: boolean; files: { name: string; uri: string }[] };
  trainingTypes: string[];
  clientTypes: string[];
  locations: string[];
  schedule: {
    days: string[];
    from: string;
    to: string;
    sameSlotsEveryWeek: boolean;
  };
  photoUri: string | null;
}

export type OnboardingProfile = ClientProfile | TrainerProfile;

export interface SubmitOnboardingResult {
  id: string;
  createdAt: string;
}

/**
 * Maps the raw onboarding store state into the role-appropriate profile sent to
 * the backend. Pure function — easy to unit test and reuse.
 */
export function buildOnboardingProfile(
  state: OnboardingState,
  role: UserRole
): OnboardingProfile {
  if (role === 'client') {
    return {
      role: 'client',
      name: state.name.trim(),
      trainingDuration: state.experienceYears,
      level: state.selfLevel,
      interests: state.trainingTypes,
      injuries: { has: state.hasInjuries, note: state.injuriesNote.trim() },
      preferredLocations: state.locations,
      availability: {
        days: state.workDays,
        from: state.workTimeStart,
        to: state.workTimeEnd,
      },
      trainerPreferences: {
        gender: state.preferredTrainerGender || 'Any',
        formats: state.preferredFormat,
      },
      photoUri: state.profilePhotoUri,
    };
  }

  return {
    role: 'trainer',
    name: state.name.trim(),
    experience: state.experienceYears,
    certifications: {
      has: state.hasCertifications,
      files: state.certifications,
    },
    trainingTypes: state.trainingTypes,
    clientTypes: state.clientTypes,
    locations: state.locations,
    schedule: {
      days: state.workDays,
      from: state.workTimeStart,
      to: state.workTimeEnd,
      sameSlotsEveryWeek: state.sameSlotsEveryWeek,
    },
    photoUri: state.profilePhotoUri,
  };
}

/** Self-classification → backend fitness_level enum. */
const LEVEL_MAP: Record<string, string> = {
  Beginner: 'beginner',
  Amateur: 'intermediate',
  Advanced: 'advanced',
  Professional: 'elite',
};

/**
 * Map a consolidated onboarding profile to the `PUT /me` payload. Pure — unit
 * tested. Only the fields the backend `UpdateProfileInput` understands are sent.
 */
export function profileToUpdateInput(
  profile: OnboardingProfile
): UpdateProfileInput {
  if (profile.role === 'client') {
    return {
      name: profile.name,
      experience: profile.trainingDuration,
      fitness_level: LEVEL_MAP[profile.level] ?? undefined,
      training_types: profile.interests,
      locations: profile.preferredLocations,
      work_schedule_days: profile.availability.days,
      work_schedule_start: profile.availability.from,
      work_schedule_end: profile.availability.to,
    };
  }

  return {
    name: profile.name,
    experience: profile.experience,
    certifications: profile.certifications.files.map((f) => f.name),
    training_types: profile.trainingTypes,
    client_types: profile.clientTypes,
    locations: profile.locations,
    work_schedule_days: profile.schedule.days,
    work_schedule_start: profile.schedule.from,
    work_schedule_end: profile.schedule.to,
  };
}

/**
 * Persist a finished onboarding profile via `PUT /me` (behind the `users`
 * readiness flag). Returns the user id. Callers handle the promise + errors;
 * onboarding completion is then marked locally (and, once `/me/onboarding/
 * complete` ships — see B8 — server-side).
 */
export async function submitOnboardingProfile(
  profile: OnboardingProfile
): Promise<SubmitOnboardingResult> {
  if (!profile.name) {
    throw new Error('Please enter your name before finishing.');
  }

  if (__DEV__) {
    logger.debug('onboardingApi: submitting profile', { profile });
  }

  return withMockFallback(
    apiReadiness.users,
    async () => {
      const { data } = await usersApi.updateMe(profileToUpdateInput(profile));

      return {
        id: data.id,
        createdAt: data.created_at ?? new Date().toISOString(),
      };
    },
    () => ({
      id: `mock-${profile.role}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    })
  );
}
