import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '../../components/layout';
import { Avatar, SectionTitle } from '../../components/ui';
import theme from '../../theme';

const { colors, spacing, radius, typography } = theme;

import { useGamificationStore } from '../../store/gamificationStore';
import { LEAGUE_TIERS } from '../../utils/game/leagues';

const topPercent = (percentile: number) =>
  Math.max(1, Math.round((1 - percentile) * 100));

export function TrainerLeagueScreen() {
  const overview = useGamificationStore((s) => s.trainerOverview);

  const board = useGamificationStore((s) => s.trainerBoard);

  const loading = useGamificationStore((s) => s.loading);

  const loadTrainer = useGamificationStore((s) => s.loadTrainer);

  useEffect(() => {
    loadTrainer();
  }, [loadTrainer]);

  const tier = overview
    ? LEAGUE_TIERS.find((t) => t.key === overview.league.key)
    : null;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Trainer league" transparent />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {!overview || !tier ? (
          <Text style={styles.muted}>
            {loading ? 'Loading…' : 'No league data yet.'}
          </Text>
        ) : (
          <>
            <View style={styles.hero}>
              <View style={[styles.heroBadge, { borderColor: tier.color }]}>
                <Ionicons name={tier.icon} size={40} color={tier.color} />
              </View>
              <Text style={styles.heroTier}>{tier.name}</Text>
              <Text style={styles.heroSub}>
                Top {topPercent(overview.percentile)}% · rank #{overview.rank}{' '}
                of {overview.poolSize}
                {overview.provisional ? ' · provisional' : ''}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.round(overview.nextTier.progress * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {overview.nextTier.name
                  ? `${Math.round(overview.nextTier.progress * 100)}% to ${overview.nextTier.name}`
                  : 'Top tier reached 🏆'}
              </Text>
            </View>

            <SectionTitle>What drives your league</SectionTitle>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="barbell" size={20} color={colors.accent} />
                <Text style={styles.statValue}>
                  {overview.completedTrainings}
                </Text>
                <Text style={styles.statLabel}>trainings</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="people" size={20} color={colors.accent} />
                <Text style={styles.statValue}>{overview.activeClients}</Text>
                <Text style={styles.statLabel}>clients</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="trophy" size={20} color={colors.accent} />
                <Text style={styles.statValue}>{overview.clientRecords}</Text>
                <Text style={styles.statLabel}>client PRs</Text>
              </View>
            </View>
            <Text style={styles.note}>
              Trainings, active clients and your clients' verified records grow
              your rank. Earnings are not counted.
            </Text>

            <SectionTitle>Trainer leaderboard</SectionTitle>
            {board.map((e) => (
              <View
                key={`${e.user.id}-${e.rank}`}
                style={[styles.row, e.isCurrentUser && styles.rowMe]}
              >
                <Text style={[styles.rank, e.rank <= 3 && styles.rankTop]}>
                  #{e.rank}
                </Text>
                <Avatar
                  name={e.user.name}
                  size={36}
                  tint={e.isCurrentUser ? 'primary' : 'blue'}
                />
                <Text
                  style={[styles.name, e.isCurrentUser && styles.nameMe]}
                  numberOfLines={1}
                >
                  {e.user.name}
                </Text>
                <Text style={styles.score}>{e.score}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
    gap: spacing.md,
  },
  muted: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  hero: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral1,
    marginBottom: spacing.xs,
  },
  heroTier: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  heroSub: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  progressLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  note: { fontSize: typography.sizes.xs, color: colors.textMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rowMe: { borderColor: colors.accent, backgroundColor: colors.surfaceSubtle },
  rank: {
    width: 36,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  rankTop: { color: colors.accent },
  name: { flex: 1, fontSize: typography.sizes.base, color: colors.text },
  nameMe: { fontWeight: typography.weights.bold },
  score: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
});
