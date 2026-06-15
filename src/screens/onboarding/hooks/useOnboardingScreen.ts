import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { stepFor } from '../../../constants';
import type { OnboardingStackParamList } from '../../../navigation/types';
import type { UserRole } from '../../../store/appStore';
import { useAppStore } from '../../../store/appStore';

export interface OnboardingScreenContext<
  R extends keyof OnboardingStackParamList,
> {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, R>;
  role: UserRole | null;
  isClient: boolean;
  /** 1-based progress step, or undefined for screens outside the numbered flow. */
  step: number | undefined;
  totalSteps: number;
}

/**
 * Shared wiring for an onboarding step: typed navigation, the active role, and
 * the role-correct progress numbers. Replaces the navigation + `useAppStore` +
 * `stepFor` boilerplate that every step screen would otherwise repeat.
 */
export function useOnboardingScreen<R extends keyof OnboardingStackParamList>(
  route: R
): OnboardingScreenContext<R> {
  const navigation =
    useNavigation<NativeStackNavigationProp<OnboardingStackParamList, R>>();

  const role = useAppStore((s) => s.userRole);

  const { step, totalSteps } = stepFor(route, role);

  return { navigation, role, isClient: role === 'client', step, totalSteps };
}
