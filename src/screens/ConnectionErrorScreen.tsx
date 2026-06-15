import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../store/authStore';
import theme from '../theme';

const { colors, spacing, radius } = theme;

/**
 * Shown on cold start when a stored session could not be verified because the
 * backend was unreachable (network/timeout/5xx) — as opposed to a 401, which
 * sends the user to login. The token is preserved; "Try again" re-runs
 * `loadSession`, recovering the session once connectivity returns.
 */
export function ConnectionErrorScreen() {
  const [retrying, setRetrying] = React.useState(false);

  const retry = React.useCallback(async () => {
    setRetrying(true);
    try {
      await useAuthStore.getState().loadSession();
    } finally {
      setRetrying(false);
    }
  }, []);

  return (
    <View testID="connection-error" style={styles.container}>
      <Ionicons
        name="cloud-offline-outline"
        size={56}
        color={colors.textMuted}
      />
      <Text style={styles.title}>Can&apos;t reach the server</Text>
      <Text style={styles.message}>
        Check your internet connection and try again. You&apos;re still signed
        in.
      </Text>
      <TouchableOpacity
        onPress={retry}
        disabled={retrying}
        style={[styles.button, retrying && styles.buttonDisabled]}
      >
        {retrying ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Try again</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.screenBg,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  message: {
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    minWidth: 160,
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
  },
});
