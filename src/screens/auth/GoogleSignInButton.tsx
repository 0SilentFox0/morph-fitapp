import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { ApiError } from '../../services/api/client';
import { useAuthStore } from '../../store/authStore';
import theme from '../../theme';

const { colors, spacing } = theme;

interface GoogleSignInButtonProps {
  /** Role to assign if this Google sign-in creates a new account. */
  role?: 'client' | 'trainer';
  onError?: (message: string) => void;
}

export function GoogleSignInButton({ role, onError }: GoogleSignInButtonProps) {
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);

  const [submitting, setSubmitting] = useState(false);

  const onPress = async () => {
    onError?.('');
    setSubmitting(true);
    try {
      await loginWithGoogle(role);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Unable to continue with Google. Please try again.';

      onError?.(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Pressable
      testID="google-signin"
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      style={[styles.button, submitting && styles.buttonDisabled]}
      onPress={onPress}
      disabled={submitting}
    >
      {submitting ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={styles.text}>
          <Text style={styles.g}>G</Text>  Continue with Google
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDisabled: { opacity: 0.6 },
  text: { color: colors.text, fontWeight: '600', fontSize: 16 },
  g: { color: '#4285F4', fontWeight: '800', fontSize: 17 },
});
