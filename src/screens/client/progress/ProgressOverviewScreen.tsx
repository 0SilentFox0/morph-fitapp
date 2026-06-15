import React from 'react';
import { LineChart } from 'react-native-chart-kit';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenHeader } from '../../../components/layout';
import { HorizontalSwipe, SectionTitle } from '../../../components/ui';
import type { ProgressStackParamList } from '../../../navigation/types';
import theme from '../../../theme';
import { formatKg, numericDate } from '../../../utils';
import { overallVolumeSeries } from '../../../utils/progress/exerciseProgress';
import { useClientTabSwipe } from '../useClientTabSwipe';
import { BodyMapCard } from './components/BodyMapCard';
import { ProgressQuickLinks } from './components/ProgressQuickLinks';

const { colors, createChartConfig, radius, typography, spacing } = theme;

import { MUSCLE_LABELS } from '../../../constants/muscles';
import { exerciseMuscleMap } from '../../../mocks';
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import type { Timeframe } from '../../../utils/progress/muscleStats';
import { computeProgressOverview } from '../../../utils/progress/progress';

type Nav = NativeStackNavigationProp<
  ProgressStackParamList,
  'ProgressOverview'
>;

const TIMEFRAMES: { key: Timeframe; label: string }[] = [
  { key: 'session', label: 'Last session' },
  { key: 'week', label: 'This week' },
  { key: 'all', label: 'All time' },
];

const chartConfig = createChartConfig();

export function ProgressOverviewScreen() {
  const navigation = useNavigation<Nav>();

  const getCurrentUserHistory = useTrainingHistoryStore(
    (s) => s.getCurrentUserHistory
  );

  const [timeframe, setTimeframe] = React.useState<Timeframe>('all');

  const [view, setView] = React.useState<'front' | 'back'>('front');

  const tabSwipe = useClientTabSwipe('ProgressTab');

  const fullHistory = getCurrentUserHistory();

  // Overall dynamics is always all-time (independent of the timeframe pills).
  const overallSeries = React.useMemo(
    () => overallVolumeSeries(fullHistory),
    [fullHistory]
  );

  const chartWidth =
    Dimensions.get('window').width - spacing.lg * 2 - spacing.md * 2;

  const { intensities, totals, topMuscles } = React.useMemo(
    () =>
      computeProgressOverview(
        fullHistory,
        exerciseMuscleMap,
        timeframe,
        new Date()
      ),
    [fullHistory, timeframe]
  );

  return (
    <HorizontalSwipe
      style={styles.container}
      onSwipeLeft={tabSwipe.onSwipeLeft}
      onSwipeRight={tabSwipe.onSwipeRight}
    >
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
                style={[
                  styles.timeframeBtn,
                  active && styles.timeframeBtnActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    active && styles.timeframeTextActive,
                  ]}
                >
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
        <BodyMapCard
          intensities={intensities}
          view={view}
          onViewChange={setView}
          onMusclePress={(muscle) =>
            navigation.navigate('MuscleDetail', { muscle })
          }
        />

        {/* Overall progress dynamics (all-time volume per session) */}
        {overallSeries.length >= 2 && (
          <>
            <SectionTitle>Overall progress</SectionTitle>
            <View style={styles.chartCard}>
              <Text style={styles.chartCaption}>Total volume per session</Text>
              <LineChart
                data={{
                  labels: overallSeries.map((p) => numericDate(p.date)),
                  datasets: [{ data: overallSeries.map((p) => p.value) }],
                }}
                width={chartWidth}
                height={200}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </View>
          </>
        )}

        {/* Muscles worked */}
        <SectionTitle>Muscles worked</SectionTitle>
        {topMuscles.length === 0 ? (
          <Text style={styles.empty}>
            No training logged for this period yet.
          </Text>
        ) : (
          <View style={styles.muscleList}>
            {topMuscles.map(({ group, stat }) => (
              <TouchableOpacity
                key={group}
                style={styles.muscleRow}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('MuscleDetail', { muscle: group })
                }
              >
                <Text style={styles.muscleName}>{MUSCLE_LABELS[group]}</Text>
                <View style={styles.muscleMeta}>
                  <Text style={styles.muscleStat}>
                    {formatKg(stat.totalWeight)}
                  </Text>
                  <Text style={styles.muscleSub}>{stat.exerciseCount} ex</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.textMuted}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick links */}
        <ProgressQuickLinks />
      </ScrollView>
    </HorizontalSwipe>
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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
    gap: spacing.lg,
  },
  timeframeRow: { flexDirection: 'row', gap: spacing.xs },
  timeframeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.neutral5,
  },
  timeframeBtnActive: {
    backgroundColor: colors.neutral3,
    borderColor: colors.text,
  },
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
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  chartCard: {
    backgroundColor: colors.neutral1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  chartCaption: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  chart: { borderRadius: radius.sm },
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
  muscleStat: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  muscleSub: { fontSize: typography.sizes.xs, color: colors.textSecondary },
});
