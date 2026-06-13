// src/components/ui/StreakBanner.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme';
import { typography } from '../../theme/typography';

interface StreakBannerProps {
  streak: number;
  sessionsThisWeek: number;
  weeklyTarget?: number;
  onPress?: () => void;
}

/** Motivation banner: current week-streak + weekly session progress. */
export function StreakBanner({ streak, sessionsThisWeek, weeklyTarget = 3, onPress }: StreakBannerProps) {
  const pct = weeklyTarget > 0 ? Math.min(1, sessionsThisWeek / weeklyTarget) : 0;
  const hasStreak = streak > 0;

  return (
    <TouchableOpacity style={styles.banner} activeOpacity={0.85} onPress={onPress} testID="streak-banner">
      <View style={styles.flame}>
        <Ionicons name="flame" size={22} color={colors.accent} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>
          {hasStreak ? `${streak}-week streak` : 'Start your streak this week'}
        </Text>
        <Text style={styles.sub}>
          {sessionsThisWeek}/{weeklyTarget} sessions this week
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct * 100}%` }]} />
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  flame: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 4 },
  title: { fontSize: typography.sizes.base, color: colors.text, fontWeight: typography.weights.semibold },
  sub: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  track: { height: 6, borderRadius: radius.pill, backgroundColor: colors.neutral3, overflow: 'hidden', marginTop: 2 },
  fill: { height: 6, borderRadius: radius.pill, backgroundColor: colors.accent },
});
