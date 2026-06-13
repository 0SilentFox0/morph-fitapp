import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { ProgressStackParamList } from '../../../navigation/types';
import { ScreenHeader } from '../../../components/layout';
import { BodyMap, SectionTitle } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import { exerciseMuscleMap } from '../../../mocks';
import {
  computeMuscleStats,
  toIntensities,
  computeTotals,
  filterByTimeframe,
  type Timeframe,
} from '../../../utils/muscleStats';
import { MUSCLE_GROUPS, MUSCLE_LABELS } from '../../../constants/muscles';

type Nav = NativeStackNavigationProp<ProgressStackParamList, 'ProgressOverview'>;

const TIMEFRAMES: { key: Timeframe; label: string }[] = [
  { key: 'session', label: 'Last session' },
  { key: 'week', label: 'This week' },
  { key: 'all', label: 'All time' },
];

const HEAT_COLORS = ['#5E1A08', '#8C1E03', '#AE451F', '#BF4F33', '#E7775B'];

const formatKg = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}t` : `${Math.round(n)}kg`;

const QUICK_LINKS: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: keyof ProgressStackParamList;
}[] = [
  { label: 'Training history', icon: 'time-outline', route: 'TrainingHistory' },
  { label: 'Personal records', icon: 'trophy-outline', route: 'PersonalRecords' },
  { label: 'Measurements', icon: 'analytics-outline', route: 'Measurements' },
  { label: 'Achievements', icon: 'medal-outline', route: 'Achievements' },
];

export function ProgressOverviewScreen() {
  const navigation = useNavigation<Nav>();
  const getCurrentUserHistory = useTrainingHistoryStore((s) => s.getCurrentUserHistory);

  const [timeframe, setTimeframe] = React.useState<Timeframe>('all');
  const [view, setView] = React.useState<'front' | 'back'>('front');

  const fullHistory = getCurrentUserHistory();

  const { intensities, totals, topMuscles } = React.useMemo(() => {
    const filtered = filterByTimeframe(fullHistory, timeframe, new Date());
    const stats = computeMuscleStats(filtered, exerciseMuscleMap);
    const sorted = MUSCLE_GROUPS.filter((g) => stats[g].exerciseCount > 0).sort(
      (a, b) => stats[b].totalWeight - stats[a].totalWeight,
    );
    return {
      intensities: toIntensities(stats),
      totals: computeTotals(filtered),
      topMuscles: sorted.map((g) => ({ group: g, stat: stats[g] })),
    };
  }, [fullHistory, timeframe]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Progress"
        showBack={false}
        transparent
        rightElement={
          <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
            <Ionicons name="medal-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Timeframe selector */}
        <View style={styles.timeframeRow}>
          {TIMEFRAMES.map((tf) => {
            const active = tf.key === timeframe;
            return (
              <TouchableOpacity
                key={tf.key}
                onPress={() => setTimeframe(tf.key)}
                style={[styles.timeframeBtn, active && styles.timeframeBtnActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.timeframeText, active && styles.timeframeTextActive]}>
                  {tf.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Summary stats */}
        <View style={styles.statsRow}>
          <StatTile label="Volume" value={formatKg(totals.tonnage)} />
          <StatTile label="Exercises" value={`${totals.exerciseCount}`} />
          <StatTile label="Sessions" value={`${totals.sessionCount}`} />
        </View>

        {/* Body map card */}
        <View style={styles.mapCard}>
          <View style={styles.faceToggle}>
            {(['front', 'back'] as const).map((f) => {
              const active = f === view;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => setView(f)}
                  style={[styles.faceBtn, active && styles.faceBtnActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.faceText, active && styles.faceTextActive]}>
                    {f === 'front' ? 'Front' : 'Back'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <BodyMap
            intensities={intensities}
            view={view}
            onMusclePress={(muscle) => navigation.navigate('MuscleDetail', { muscle })}
          />

          {/* Heat legend */}
          <View style={styles.legend}>
            <Text style={styles.legendLabel}>Less</Text>
            <View style={styles.legendBar}>
              {HEAT_COLORS.map((c) => (
                <View key={c} style={[styles.legendSwatch, { backgroundColor: c }]} />
              ))}
            </View>
            <Text style={styles.legendLabel}>More</Text>
          </View>
        </View>

        {/* Muscles worked */}
        <SectionTitle>Muscles worked</SectionTitle>
        {topMuscles.length === 0 ? (
          <Text style={styles.empty}>No training logged for this period yet.</Text>
        ) : (
          <View style={styles.muscleList}>
            {topMuscles.map(({ group, stat }) => (
              <TouchableOpacity
                key={group}
                style={styles.muscleRow}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('MuscleDetail', { muscle: group })}
              >
                <Text style={styles.muscleName}>{MUSCLE_LABELS[group]}</Text>
                <View style={styles.muscleMeta}>
                  <Text style={styles.muscleStat}>{formatKg(stat.totalWeight)}</Text>
                  <Text style={styles.muscleSub}>{stat.exerciseCount} ex</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick links */}
        <View style={styles.linksGrid}>
          {QUICK_LINKS.map((link) => (
            <TouchableOpacity
              key={link.route}
              style={styles.linkCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(link.route as never)}
            >
              <Ionicons name={link.icon} size={22} color={colors.accent} />
              <Text style={styles.linkLabel}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['2xl'] + spacing.tabBarInset, gap: spacing.lg },
  timeframeRow: { flexDirection: 'row', gap: spacing.xs },
  timeframeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.neutral5,
  },
  timeframeBtnActive: { backgroundColor: colors.neutral3, borderColor: colors.text },
  timeframeText: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  timeframeTextActive: { color: colors.text },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statTile: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.text },
  statLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  mapCard: {
    backgroundColor: colors.neutral1,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  faceToggle: {
    flexDirection: 'row',
    backgroundColor: colors.neutral3,
    borderRadius: radius.pill,
    padding: 3,
  },
  faceBtn: { paddingHorizontal: spacing.lg, paddingVertical: 6, borderRadius: radius.pill },
  faceBtnActive: { backgroundColor: colors.accent },
  faceText: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  faceTextActive: { color: colors.white, fontWeight: typography.weights.semibold },
  legend: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendLabel: { fontSize: typography.sizes.xs, color: colors.textMuted },
  legendBar: { flexDirection: 'row', borderRadius: radius.sm, overflow: 'hidden' },
  legendSwatch: { width: 22, height: 8 },
  empty: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  muscleList: { gap: spacing.xs },
  muscleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  muscleName: { fontSize: typography.sizes.base, color: colors.text },
  muscleMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  muscleStat: { fontSize: typography.sizes.sm, color: colors.text, fontWeight: typography.weights.semibold },
  muscleSub: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  linksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  linkCard: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  linkLabel: { fontSize: typography.sizes.sm, color: colors.text, flexShrink: 1 },
});
