import type { UserRole } from '../store/appStore';
import type { OnboardingState } from '../store/onboardingStore';
import { logger } from './logger';

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

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Mock backend submission for a finished onboarding profile. Simulates network
 * latency and returns the created user id. Swap the body for a real
 * `apiFetch('/users', { method: 'POST', body: JSON.stringify(profile) })`
 * once the backend exists — callers already handle the promise + errors.
 */
export async function submitOnboardingProfile(
  profile: OnboardingProfile
): Promise<SubmitOnboardingResult> {
  await delay(800);

  if (!profile.name) {
    throw new Error('Please enter your name before finishing.');
  }

  if (__DEV__) {
    logger.debug('onboardingApi: (mock) submitting profile', { profile });
  }

  return {
    id: `mock-${profile.role}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
}
