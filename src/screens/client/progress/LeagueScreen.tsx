import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenHeader } from '../../../components/layout';
import { SectionTitle } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { typography } from '../../../theme/typography';
import type { ProgressStackParamList } from '../../../navigation/types';
import { useGamificationStore } from '../../../store/gamificationStore';
import { LEAGUE_TIERS } from '../../../utils/leagues';

type Nav = NativeStackNavigationProp<ProgressStackParamList, 'League'>;

const topPercent = (percentile: number) => Math.max(1, Math.round((1 - percentile) * 100));

export function LeagueScreen() {
  const navigation = useNavigation<Nav>();
  const overview = useGamificationStore((s) => s.overview);
  const loading = useGamificationStore((s) => s.loading);
  const loadOverview = useGamificationStore((s) => s.loadOverview);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="My league" transparent />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {!overview ? (
          <Text style={styles.muted}>{loading ? 'Loading…' : 'No league data yet.'}</Text>
        ) : (
          <>
            <View style={styles.hero}>
              <View style={[styles.heroBadge, { borderColor: tierColor(overview.league.key) }]}>
                <Ionicons name={tierIcon(overview.league.key)} size={44} color={tierColor(overview.league.key)} />
              </View>
              <Text style={styles.heroTier}>{overview.league.name}</Text>
              <Text style={styles.heroSub}>
                Top {topPercent(overview.percentile)}% · rank #{overview.rank} of {overview.poolSize}
                {overview.provisional ? ' · provisional' : ''}
              </Text>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round(overview.nextTier.progress * 100)}%` }]} />
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
                <Ionicons name="repeat" size={20} color={colors.accent} />
                <Text style={styles.statValue}>{Math.round(overview.consistencyScore * 100)}%</Text>
                <Text style={styles.statLabel}>consistency</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="barbell" size={20} color={colors.accent} />
                <Text style={styles.statValue}>Top {topPercent(overview.strengthScore)}%</Text>
                <Text style={styles.statLabel}>strength</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="star" size={20} color={colors.accent} />
                <Text style={styles.statValue}>{overview.points}</Text>
                <Text style={styles.statLabel}>points</Text>
              </View>
            </View>
            <Text style={styles.note}>
              Consistency (regular, long-term training) counts most; verified strength vs everyone else
              adds a bonus.
            </Text>

            <SectionTitle>Leagues</SectionTitle>
            <View style={styles.ladder}>
              {[...LEAGUE_TIERS].reverse().map((tier) => {
                const current = tier.key === overview.league.key;
                return (
                  <View key={tier.key} style={[styles.ladderRow, current && styles.ladderRowCurrent]}>
                    <Ionicons name={tier.icon} size={22} color={tier.color} />
                    <View style={styles.ladderText}>
                      <Text style={[styles.ladderName, current && styles.ladderNameCurrent]}>{tier.name}</Text>
                      <Text style={styles.ladderBand}>
                        Top {Math.round((1 - tier.minPercentile) * 100)}%
                        {tier.maxPercentile < 1 ? `–${Math.max(1, Math.round((1 - tier.maxPercentile) * 100))}%` : ''}
                      </Text>
                    </View>
                    {current && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Leaderboard')}>
              <Ionicons name="podium" size={18} color={colors.white} />
              <Text style={styles.ctaText}>View leaderboards</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const tierColor = (key: string) => LEAGUE_TIERS.find((t) => t.key === key)?.color ?? colors.accent;
const tierIcon = (key: string) =>
  LEAGUE_TIERS.find((t) => t.key === key)?.icon ?? ('medal' as const);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['2xl'] + spacing.tabBarInset, gap: spacing.md },
  muted: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  hero: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral1,
    marginBottom: spacing.xs,
  },
  heroTier: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.text },
  heroSub: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.accent },
  progressLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: spacing.xs },
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
  note: { fontSize: typography.sizes.xs, color: colors.textMuted },
  ladder: { backgroundColor: colors.cardBg, borderRadius: radius.lg, overflow: 'hidden' },
  ladderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral3,
  },
  ladderRowCurrent: { backgroundColor: colors.surfaceSubtle },
  ladderText: { flex: 1 },
  ladderName: { fontSize: typography.sizes.base, color: colors.textSecondary, fontWeight: typography.weights.medium },
  ladderNameCurrent: { color: colors.text, fontWeight: typography.weights.bold },
  ladderBand: { fontSize: typography.sizes.xs, color: colors.textMuted },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  ctaText: { color: colors.white, fontSize: typography.sizes.base, fontWeight: typography.weights.semibold },
});
