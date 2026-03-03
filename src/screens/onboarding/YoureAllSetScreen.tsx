import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAppStore } from '../../store/appStore';

export function YoureAllSetScreen() {
  const { setOnboarded } = useAppStore();

  const handleGoHome = () => {
    setOnboarded(true);
    // Navigation will be handled by root - we need to use a different approach
    // The root navigator checks isOnboarded, so we need to trigger a re-render
    setOnboarded(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Ionicons name="flash" size={24} color={colors.text} />
        <Text style={styles.logoText}>FITNESS</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>You're all set!</Text>
        <Text style={styles.subtitle}>
          Your trainer profile is now live and visible to clients.
        </Text>

        <Card style={styles.achievementCard}>
          <View style={styles.achievementIcon}>
            <Ionicons name="trophy" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.achievementLabel}>Achievement unlocked</Text>
          <Text style={styles.achievementTitle}>Profile Complete</Text>
          <Text style={styles.achievementDesc}>
            Earn more achievements by update your profile and be on top
          </Text>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>+ 20</Text>
            <Ionicons name="diamond" size={16} color={colors.text} />
          </View>
        </Card>

        <Button
          title="Go to Homepage"
          onPress={handleGoHome}
          style={styles.primaryBtn}
        />
        <Button
          title="View your profile"
          onPress={handleGoHome}
          variant="outline"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 60,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    alignItems: 'center',
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
    backgroundColor: colors.Accent1,
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
  primaryBtn: {
    width: '100%',
    marginBottom: spacing.md,
  },
});
