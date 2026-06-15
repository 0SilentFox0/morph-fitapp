import React from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface ConfirmLeaveOptions {
  title?: string;
  message?: string;
  /** Label for the confirm-and-leave action. */
  leaveLabel?: string;
  /** Label for the stay-here action. */
  stayLabel?: string;
}

/**
 * Intercepts a back/pop navigation and asks the user to confirm before leaving.
 *
 * `shouldBlock` is evaluated at the moment the screen is about to be removed
 * (not captured in a closure), so callers can gate on live store state — e.g.
 * "a training session is in progress". When it returns false the navigation
 * proceeds untouched. Pass a stable (useCallback) predicate.
 */
export function useConfirmLeave(
  shouldBlock: () => boolean,
  options?: ConfirmLeaveOptions
): void {
  const navigation = useNavigation();

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!shouldBlock()) return;

      e.preventDefault();

      Alert.alert(
        options?.title ?? 'Leave training?',
        options?.message ??
          'Your logged sets are saved, but the session will close.',
        [
          { text: options?.stayLabel ?? 'Stay', style: 'cancel' },
          {
            text: options?.leaveLabel ?? 'Leave',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, shouldBlock, options]);
}
