import React from 'react';
import { numericDate, formatKg } from '../../../utils';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getChartWidth } from '../../../utils/common/layout';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import type { ProgressStackParamList } from '../../../navigation/types';
import { ScreenHeader } from '../../../components/layout';
import { SectionTitle } from '../../../components/ui';
import theme from '../../../theme';
const { colors, createChartConfig, radius, typography, spacing } = theme;
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import { exerciseMuscleMap, exerciseCatalog } from '../../../mocks';
import type { ExerciseSet } from '../../../types';
import { computeMuscleStats, muscleTrend } from '../../../utils/progress/muscleStats';
import { MUSCLE_LABELS } from '../../../constants/muscles';

type Route = RouteProp<ProgressStackParamList, 'MuscleDetail'>;

const chartConfig = createChartConfig();



function summarizeSets(sets: ExerciseSet[]): string {
  return sets
    .map((s) => (s.weight > 0 ? `${s.weight}×${s.reps}` : `${s.reps} reps`))
    .join(', ');
}

export function MuscleDetailScreen() {
  const route = useRoute<Route>();
  const muscle = route.params.muscle;
  const getCurrentUserHistory = useTrainingHistoryStore((s) => s.getCurrentUserHistory);
  const history = getCurrentUserHistory();

  const { stat, trend, exercises } = React.useMemo(() => {
    const stats = computeMuscleStats(history, exerciseMuscleMap);
    const trendPoints = muscleTrend(history, muscle, exerciseMuscleMap);

    // Distinct exercises that hit this muscle, with their most recent logged sets.
    const lastSets = new Map<number, ExerciseSet[]>();
    for (const training of history) {
      for (const logged of training.exercises) {
        if (exerciseMuscleMap[logged.exerciseId]?.includes(muscle)) {
          lastSets.set(logged.exerciseId, logged.sets); // later trainings overwrite → newest wins
        }
      }
    }
    return {
      stat: stats[muscle],
      trend: trendPoints,
      exercises: Array.from(lastSets.entries()).map(([id, sets]) => ({
        id,
        name: exerciseCatalog[id]?.name ?? `Exercise ${id}`,
        sets,
      })),
    };
  }, [history, muscle]);

  const chartWidth = getChartWidth(spacing.md * 2);

  return (
    <View style={styles.container}>
      <ScreenHeader title={MUSCLE_LABELS[muscle]} transparent />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <StatTile label="Total volume" value={formatKg(stat.totalWeight)} />
          <StatTile label="Exercises" value={`${stat.exerciseCount}`} />
          <StatTile label="Sets" value={`${stat.setCount}`} />
        </View>

        <SectionTitle>Volume over time</SectionTitle>
        {trend.length >= 2 ? (
          <View style={styles.chartCard}>
            <LineChart
              data={{
                labels: trend.map((p) => numericDate(p.date)),
                datasets: [{ data: trend.map((p) => p.tonnage) }],
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
        ) : (
          <Text style={styles.empty}>
            Not enough sessions yet to chart a trend for this muscle.
          </Text>
        )}

        <SectionTitle>Exercises</SectionTitle>
        {exercises.length === 0 ? (
          <Text style={styles.empty}>No exercises logged for this muscle yet.</Text>
        ) : (
          <View style={styles.exerciseList}>
            {exercises.map((ex) => (
              <View key={ex.id} style={styles.exerciseRow}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Text style={styles.exerciseSets}>{summarizeSets(ex.sets)}</Text>
              </View>
            ))}
          </View>
        )}
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
  content: { padding: spacing.lg, paddingBottom: spacing['2xl'] + spacing.tabBarInset, gap: spacing.md },
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
  chartCard: { backgroundColor: colors.neutral1, borderRadius: radius.lg, padding: spacing.md },
  chart: { borderRadius: radius.sm },
  empty: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  exerciseList: { gap: spacing.xs },
  exerciseRow: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  exerciseName: { fontSize: typography.sizes.base, color: colors.text, fontWeight: typography.weights.medium },
  exerciseSets: { fontSize: typography.sizes.sm, color: colors.textSecondary },
});
