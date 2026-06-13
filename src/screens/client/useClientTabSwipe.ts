import { useNavigation } from '@react-navigation/native';
import type { ClientTabParamList } from '../../navigation/types';

/** Tabs reachable by horizontal swipe, left → right (the central "+" is excluded). */
const SWIPE_ORDER: (keyof ClientTabParamList)[] = ['ClientHomeTab', 'TrainersTab', 'ProgressTab'];

type TabNav = { navigate: (name: string) => void };

/**
 * Swipe handlers for a client tab's root screen: swipe left advances to the next
 * tab, swipe right goes to the previous one. Returns no-ops at the ends so the
 * gesture simply does nothing there.
 */
export function useClientTabSwipe(current: keyof ClientTabParamList) {
  const navigation = useNavigation();
  const idx = SWIPE_ORDER.indexOf(current);

  const goTo = (i: number) => {
    const target = SWIPE_ORDER[i];
    if (!target) return;
    (navigation.getParent() as unknown as TabNav | undefined)?.navigate(target);
  };

  return {
    onSwipeLeft: idx >= 0 && idx < SWIPE_ORDER.length - 1 ? () => goTo(idx + 1) : undefined,
    onSwipeRight: idx > 0 ? () => goTo(idx - 1) : undefined,
  };
}
