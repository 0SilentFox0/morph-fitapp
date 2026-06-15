import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { ApiError } from '../../services/api/client';
import theme from '../../theme';
const { colors, spacing } = theme;

export function LoginScreen() {
  const login = useAuthStore((s) => s.login);
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
      const message = e instanceof ApiError ? e.message : 'Unable to sign in. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>

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
        accessibilityLabel="Sign in"
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={submitting}
      >
        {submitting ? <ActivityIndicator color={colors.text} /> : <Text style={styles.buttonText}>Sign in</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', marginBottom: spacing.md },
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
});
