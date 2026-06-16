import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '../../navigation/types';
import * as authApi from '../../services/api/auth';
import { ApiError } from '../../services/api/client';
import theme from '../../theme';

const { colors, spacing } = theme;

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');

  const emailRef = useRef('');

  const [error, setError] = useState<string | null>(null);

  const [sent, setSent] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);

    const emailValue = emailRef.current.trim();

    if (!emailValue.includes('@')) {
      setError('Please enter a valid email.');

      return;
    }

    setSubmitting(true);
    try {
      await authApi.forgotPassword(emailValue);
      setSent(true);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : 'Unable to send the reset link. Please try again.';

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.body}>
          If an account exists for {emailRef.current.trim()}, we sent a link to
          reset your password. Enter the code from that email on the next screen.
        </Text>
        <Pressable
          testID="forgot-go-reset"
          accessibilityRole="button"
          style={styles.button}
          onPress={() => navigation.navigate('ResetPassword')}
        >
          <Text style={styles.buttonText}>I have a reset code</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.linkRow}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.link}>Back to sign in</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.body}>
        Enter your email and we'll send you a link to reset your password.
      </Text>

      <TextInput
        testID="forgot-email"
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
        value={email}
        onChangeText={(v) => {
          emailRef.current = v;
          setEmail(v);
        }}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        testID="forgot-submit"
        accessibilityRole="button"
        accessibilityLabel="Send reset link"
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.buttonText}>Send reset link</Text>
        )}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        style={styles.linkRow}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.link}>Back to sign in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  body: { color: colors.textMuted, fontSize: 15, lineHeight: 21 },
  input: {
    backgroundColor: colors.inputBg,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: { color: colors.Error },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.text, fontWeight: '600', fontSize: 16 },
  linkRow: { alignItems: 'center', marginTop: spacing.sm },
  link: { color: colors.accent, fontWeight: '600' },
});
