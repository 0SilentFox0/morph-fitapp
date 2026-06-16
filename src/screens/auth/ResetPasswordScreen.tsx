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

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const [token, setToken] = useState(route.params?.token ?? '');

  const [password, setPassword] = useState('');

  const [confirm, setConfirm] = useState('');

  const tokenRef = useRef(route.params?.token ?? '');

  const passwordRef = useRef('');

  const confirmRef = useRef('');

  const [error, setError] = useState<string | null>(null);

  const [done, setDone] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);

    if (!tokenRef.current.trim()) {
      setError('Enter the reset code from your email.');

      return;
    }

    if (passwordRef.current.length < 8) {
      setError('Password must be at least 8 characters.');

      return;
    }

    if (passwordRef.current !== confirmRef.current) {
      setError('Passwords do not match.');

      return;
    }

    setSubmitting(true);
    try {
      await authApi.resetPassword({
        token: tokenRef.current.trim(),
        password: passwordRef.current,
        password_confirmation: confirmRef.current,
      });
      setDone(true);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : 'Unable to reset your password. Please try again.';

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Password updated</Text>
        <Text style={styles.body}>
          Your password has been reset. You can now sign in with your new
          password.
        </Text>
        <Pressable
          testID="reset-go-login"
          accessibilityRole="button"
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Back to sign in</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set a new password</Text>

      <TextInput
        testID="reset-token"
        style={styles.input}
        placeholder="Reset code"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        value={token}
        onChangeText={(v) => {
          tokenRef.current = v;
          setToken(v);
        }}
      />
      <TextInput
        testID="reset-password"
        style={styles.input}
        placeholder="New password (min 8 characters)"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        textContentType="newPassword"
        value={password}
        onChangeText={(v) => {
          passwordRef.current = v;
          setPassword(v);
        }}
      />
      <TextInput
        testID="reset-confirm"
        style={styles.input}
        placeholder="Confirm new password"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
        value={confirm}
        onChangeText={(v) => {
          confirmRef.current = v;
          setConfirm(v);
        }}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        testID="reset-submit"
        accessibilityRole="button"
        accessibilityLabel="Reset password"
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.buttonText}>Reset password</Text>
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
