import { TRAINING_TYPES } from './training';

/**
 * Onboarding option lists. Training types reuse the canonical TRAINING_TYPES
 * and append "Other" so the onboarding chip grid stays in sync with the rest
 * of the app instead of re-declaring the list.
 */
export const ONBOARDING_TRAINING_TYPES: readonly string[] = [...TRAINING_TYPES, 'Other'];

export const CLIENT_TYPES: readonly string[] = [
  'Beginners',
  'Pro',
  'Women',
  'Men',
  '50+',
  'Strength',
  'Other',
];

export const TRAINING_LOCATIONS: readonly string[] = [
  'Online',
  "In-person at client's home",
  'At the gym',
  'Outdoors',
];

/**
 * Client onboarding option lists. The client flow reuses the trainer screens
 * with mirrored questions (see onboardingSteps.ts), so these complement the
 * lists above: how a client rates themselves, and what they want in a trainer.
 */
export const CLIENT_LEVELS: readonly string[] = [
  'Beginner',
  'Amateur',
  'Advanced',
  'Professional',
];

export const TRAINER_GENDER_PREFS: readonly string[] = ['Any', 'Female', 'Male'];

export const TRAINING_FORMATS: readonly string[] = ['Online', 'In-person'];
