import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../../components/ui';
import theme from '../../../theme';
const { colors, radius, typography, spacing } = theme;
import { useAppStore } from '../../../store/appStore';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { buildOnboardingProfile, submitOnboardingProfile } from '../../../services/onboardingApi';
import { toErrorMessage } from '../../../utils/format/error';
import { OnboardingLayout } from '../components/OnboardingLayout';

export function YoureAllSetScreen() {
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const addPoints = useAppStore((s) => s.addPoints);
  const role = useAppStore((s) => s.userRole);
  const isClient = role === 'client';
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const [submitting, setSubmitting] = React.useState(false);

  const handleComplete = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Send the consolidated profile to the backend, then clear local state.
      const profile = buildOnboardingProfile(useOnboardingStore.getState(), role ?? 'trainer');
      await submitOnboardingProfile(profile);
      addPoints(20);
      resetOnboarding();
      setOnboarded(true);
    } catch (e) {
      setSubmitting(false);
      Alert.alert("Couldn't finish setup", toErrorMessage(e));
    }
  };

  return (
    <OnboardingLayout showFooter={false} centerContent scrollContentStyle={styles.centered}>
      <Text style={styles.title}>You're all set!</Text>
      <Text style={styles.subtitle}>
        {isClient
          ? "We'll match you with the best trainers for your goals."
          : 'Your trainer profile is now live and visible to clients.'}
      </Text>

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
        title="Go to Homepage"
        onPress={handleComplete}
        loading={submitting}
        style={styles.primaryBtn}
      />
      <Button
        title="View your profile"
        onPress={handleComplete}
        disabled={submitting}
        variant="outline"
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center' },
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
  achievementCard: { alignItems: 'center', marginBottom: spacing.xl, padding: spacing.xl },
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
