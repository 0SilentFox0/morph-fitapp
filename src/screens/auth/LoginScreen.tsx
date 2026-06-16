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
import { ApiError } from '../../services/api/client';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import theme from '../../theme';
import { GoogleSignInButton } from './GoogleSignInButton';

const { colors, spacing } = theme;

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

// navigation is optional so the screen renders standalone in unit tests; the
// footer links are no-ops without it.
export function LoginScreen({ navigation }: Partial<Props>) {
  const login = useAuthStore((s) => s.login);

  const loginAsTestUser = useAuthStore((s) => s.loginAsTestUser);

  const setSignupMode = useAppStore((s) => s.setSignupMode);

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // Refs mirror state so onSubmit always reads the latest values regardless of
  // when React schedules the re-render after fireEvent.changeText in tests.
  const emailRef = useRef('');

  const passwordRef = useRef('');

  const handleEmailChange = (value: string) => {
    emailRef.current = value;
    setEmail(value);
  };

  const handlePasswordChange = (value: string) => {
    passwordRef.current = value;
    setPassword(value);
  };

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login(emailRef.current.trim(), passwordRef.current);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : 'Unable to sign in. Please try again.';

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in</Text>

      <TextInput
        testID="login-email"
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
        value={email}
        onChangeText={handleEmailChange}
      />
      <TextInput
        testID="login-password"
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
        value={password}
        onChangeText={handlePasswordChange}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        testID="login-submit"
        accessibilityRole="button"
        accessibilityLabel="Log in"
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.buttonText}>Log in</Text>
        )}
      </Pressable>

      <Pressable
        testID="login-forgot"
        accessibilityRole="button"
        style={styles.forgotRow}
        onPress={() => navigation?.navigate('ForgotPassword')}
      >
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.divider} />
      </View>

      <GoogleSignInButton onError={(m) => setError(m || null)} />

      <Pressable
        testID="login-go-register"
        accessibilityRole="button"
        style={styles.registerRow}
        onPress={() => setSignupMode(true)}
      >
        <Text style={styles.linkMuted}>Don't have an account? </Text>
        <Text style={styles.link}>Create account</Text>
      </Pressable>

      {__DEV__ && (
        <Pressable
          testID="login-dev-test"
          accessibilityRole="button"
          style={styles.devRow}
          onPress={() => loginAsTestUser('client')}
        >
          <Text style={styles.devText}>Log in as test user (dev)</Text>
        </Pressable>
      )}
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
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
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
  forgotRow: { alignItems: 'flex-end' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  linkMuted: { color: colors.textMuted },
  link: { color: colors.accent, fontWeight: '600' },
  devRow: { alignItems: 'center', marginTop: spacing.sm },
  devText: { color: colors.textMuted, fontSize: 13 },
});
