import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useAppStore } from '../../../store/appStore';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { OnboardingLayout } from '../components/OnboardingLayout';

export function YoureAllSetScreen() {
  const { setOnboarded, addPoints } = useAppStore();
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  const handleComplete = () => {
    addPoints(20);
    resetOnboarding();
    setOnboarded(true);
  };

  return (
    <OnboardingLayout showFooter={false} centerContent scrollContentStyle={styles.centered}>
      <Text style={styles.title}>You're all set!</Text>
      <Text style={styles.subtitle}>Your trainer profile is now live and visible to clients.</Text>

      <Card style={styles.achievementCard}>
        <View style={styles.achievementIcon}>
          <Ionicons name="trophy" size={48} color="#FFFFFF" />
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

      <Button title="Go to Homepage" onPress={handleComplete} style={styles.primaryBtn} />
      <Button title="View your profile" onPress={handleComplete} variant="outline" />
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
    borderRadius: 20,
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
