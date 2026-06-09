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
