import React from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card } from '../../../components/ui';
import theme from '../../../theme';

const { colors, radius, typography, spacing } = theme;

import {
  buildOnboardingProfile,
  submitOnboardingProfile,
} from '../../../services/onboardingApi';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/authStore';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { toErrorMessage } from '../../../utils/format/error';
import { OnboardingLayout } from '../components/OnboardingLayout';

export function YoureAllSetScreen() {
  const setOnboarded = useAppStore((s) => s.setOnboarded);

  const addPoints = useAppStore((s) => s.addPoints);

  const setSignupMode = useAppStore((s) => s.setSignupMode);

  const role = useAppStore((s) => s.userRole);

  const status = useAuthStore((s) => s.status);

  const register = useAuthStore((s) => s.register);

  const isClient = role === 'client';

  // Sign-up runs onboarding before the account exists, so the account is created
  // here at the end. An already-authenticated first-run user skips this.
  const needsAccount = status !== 'authenticated';

  const [email, setEmail] = React.useState('');

  const [password, setPassword] = React.useState('');

  const [confirm, setConfirm] = React.useState('');

  const [submitting, setSubmitting] = React.useState(false);

  const handleComplete = async () => {
    if (submitting) return;

    if (needsAccount) {
      const emailValue = email.trim();

      if (!emailValue.includes('@')) {
        Alert.alert('Check your email', 'Please enter a valid email address.');

        return;
      }

      if (password.length < 8) {
        Alert.alert(
          'Weak password',
          'Password must be at least 8 characters.'
        );

        return;
      }

      if (password !== confirm) {
        Alert.alert('Passwords differ', 'The two passwords do not match.');

        return;
      }
    }

    setSubmitting(true);
    try {
      const state = useOnboardingStore.getState();

      // Create the account first (authenticates the session) so the profile PUT
      // that follows is authorized.
      if (needsAccount) {
        await register({
          name: state.name.trim(),
          email: email.trim(),
          password,
          password_confirmation: confirm,
          role: role ?? 'client',
        });
      }

      // Send the consolidated profile to the backend, then mark complete. The
      // onboarding store is intentionally NOT reset: the Profile screen reads it
      // for display, so wiping it would blank a freshly-created profile.
      const profile = buildOnboardingProfile(state, role ?? 'trainer');

      await submitOnboardingProfile(profile);
      addPoints(20);
      setSignupMode(false);
      setOnboarded(true);
    } catch (e) {
      setSubmitting(false);
      Alert.alert("Couldn't finish setup", toErrorMessage(e));
    }
  };

  return (
    <OnboardingLayout
      showFooter={false}
      centerContent
      scrollContentStyle={styles.centered}
    >
      <Text style={styles.title}>
        {needsAccount ? 'Create your account' : "You're all set!"}
      </Text>
      <Text style={styles.subtitle}>
        {needsAccount
          ? 'Set your login details to save your profile and finish.'
          : isClient
            ? "We'll match you with the best trainers for your goals."
            : 'Your trainer profile is now live and visible to clients.'}
      </Text>

      {needsAccount && (
        <View style={styles.form}>
          <TextInput
            testID="signup-email"
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            testID="signup-password"
            style={styles.input}
            placeholder="Password (min 8 characters)"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            textContentType="newPassword"
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            testID="signup-confirm"
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            textContentType="newPassword"
            value={confirm}
            onChangeText={setConfirm}
          />
        </View>
      )}

      <Card style={styles.achievementCard}>
        <View style={styles.achievementIcon}>
          <Ionicons name="trophy" size={48} color={colors.white} />
        </View>
        <Text style={styles.achievementLabel}>Achievement unlocked</Text>
        <Text style={styles.achievementTitle}>Profile Complete</Text>
        <Text style={styles.achievementDesc}>
          Earn more achievements by updating your profile and staying on top
        </Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>+ 20</Text>
          <Ionicons name="diamond" size={16} color={colors.text} />
        </View>
      </Card>

      <Button
        title={needsAccount ? 'Create account' : 'Go to Homepage'}
        onPress={handleComplete}
        loading={submitting}
        style={styles.primaryBtn}
      />
      {!needsAccount && (
        <Button
          title="View your profile"
          onPress={handleComplete}
          disabled={submitting}
          variant="outline"
        />
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center' },
  form: { width: '100%', gap: spacing.sm, marginBottom: spacing.xl },
  input: {
    backgroundColor: colors.inputBg,
    color: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  achievementCard: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    padding: spacing.xl,
  },
  achievementIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  achievementLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  achievementTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  achievementDesc: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pointsText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  primaryBtn: { width: '100%', marginBottom: spacing.md },
});
