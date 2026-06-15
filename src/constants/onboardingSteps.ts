import type { OnboardingStackParamList } from '../navigation/types';
import type { UserRole } from '../store/appStore';

type StepRoute = keyof OnboardingStackParamList;

/**
 * Ordered numbered steps per role. The progress dots and "Step X of N" come
 * from a route's position here. Screens that are not listed (ChooseRole,
 * Welcome, PreviewProfile, YoureAllSet) render no progress indicator.
 *
 * Trainer and client share the same screens with mirrored questions; the only
 * structural difference is the client-only TrainerPreferences step.
 */
const TRAINER_STEPS: readonly StepRoute[] = [
  'WhatsYourName',
  'Experience',
  'TrainingTypes',
  'ClientTypes',
  'WhereTrain',
  'WorkSchedule',
  'ProfilePhoto',
];

const CLIENT_STEPS: readonly StepRoute[] = [
  'WhatsYourName',
  'Experience',
  'TrainingTypes',
  'ClientTypes',
  'WhereTrain',
  'WorkSchedule',
  'TrainerPreferences',
  'ProfilePhoto',
];

/**
 * Returns the 1-based step number for a route and the total step count, based
 * on the active role. `step` is undefined for routes outside the numbered flow.
 */
export function stepFor(
  route: StepRoute,
  role: UserRole | null
): { step: number | undefined; totalSteps: number } {
  const sequence = role === 'client' ? CLIENT_STEPS : TRAINER_STEPS;

  const index = sequence.indexOf(route);

  return {
    step: index >= 0 ? index + 1 : undefined,
    totalSteps: sequence.length,
  };
}
