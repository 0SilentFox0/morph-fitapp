import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../components/layout';
import { SectionTitle } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import { useAppStore } from '../../../store/appStore';
import { activeDayKeys, computeWeekStreak, computeBadges } from '../../../utils/achievements';

const WEEKS = 5;
const DAYS = WEEKS * 7;
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export function AchievementsScreen() {
  const history = useTrainingHistoryStore((s) => s.getCurrentUserHistory());
  const points = useAppStore((s) => s.points);

  const now = new Date();
  const active = activeDayKeys(history);
  const streak = computeWeekStreak(history, now);
  const badges = computeBadges(history, points, now);
  const earnedCount = badges.filter((b) => b.earned).length;

  // Build a 5-week grid ending today. Start at the Sunday WEEKS-1 weeks back.
  const gridStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  gridStart.setDate(gridStart.getDate() - gridStart.getDay() - (WEEKS - 1) * 7);
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Achievements" transparent />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={22} color={colors.accent} />
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>week streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="medal" size={22} color={colors.accent} />
            <Text style={styles.statValue}>{earnedCount}/{badges.length}</Text>
            <Text style={styles.statLabel}>badges</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={22} color={colors.accent} />
            <Text style={styles.statValue}>{points}</Text>
            <Text style={styles.statLabel}>points</Text>
          </View>
        </View>

        <SectionTitle>Activity</SectionTitle>
        <View style={styles.calendarCard}>
          <View style={styles.weekHeader}>
            {WEEKDAY_LABELS.map((l, i) => (
              <Text key={i} style={styles.weekHeaderText}>{l}</Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {days.map((d, i) => {
              const isActive = active.has(dayKey(d));
              const isToday = dayKey(d) === dayKey(now);
              return (
                <View
                  key={i}
                  style={[
                    styles.dayCell,
                    isActive && styles.dayCellActive,
                    isToday && styles.dayCellToday,
                  ]}
                />
              );
            })}
          </View>
        </View>

        <SectionTitle>Badges</SectionTitle>
        <View style={styles.badgeGrid}>
          {badges.map((b) => (
            <View key={b.id} style={[styles.badgeCard, !b.earned && styles.badgeLocked]}>
              <Ionicons
                name={b.icon as keyof typeof Ionicons.glyphMap}
                size={26}
                color={b.earned ? colors.accent : colors.textMuted}
              />
              <Text style={[styles.badgeLabel, !b.earned && styles.badgeLabelLocked]}>{b.label}</Text>
              <Text style={styles.badgeDesc}>{b.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['2xl'] + spacing.tabBarInset, gap: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text },
  statLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  calendarCard: { backgroundColor: colors.neutral1, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-around' },
  weekHeaderText: { flex: 1, textAlign: 'center', fontSize: typography.sizes.xs, color: colors.textMuted },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral3,
    borderWidth: 2,
    borderColor: colors.neutral1,
  },
  dayCellActive: { backgroundColor: colors.accent },
  dayCellToday: { borderColor: colors.text },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badgeCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  badgeLocked: { opacity: 0.55 },
  badgeLabel: { fontSize: typography.sizes.base, color: colors.text, fontWeight: typography.weights.semibold },
  badgeLabelLocked: { color: colors.textSecondary },
  badgeDesc: { fontSize: typography.sizes.xs, color: colors.textSecondary },
});
