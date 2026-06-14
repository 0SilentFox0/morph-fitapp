import { useNavigation } from '@react-navigation/native';

export interface TabNavigation {
  navigate: (name: string, params?: object) => void;
}

/**
 * The parent tab navigator, typed for cross-tab `navigate()` calls. Returns
 * undefined when there is no parent (e.g. a screen rendered in isolation/tests).
 * Wraps the `getParent() as unknown as TabNav` cast that was duplicated — with
 * two separate local `TabNav` types — across the client/home/stats screens.
 */
export function useTabNavigation(): TabNavigation | undefined {
  const navigation = useNavigation();
  return navigation.getParent() as unknown as TabNavigation | undefined;
}
