import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import type { ProgressStackParamList } from '../../../navigation/types';
import { ScreenHeader } from '../../../components/layout';
import { SectionTitle } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import { exerciseCatalog } from '../../../mocks';
import type { ExerciseSet } from '../../../mocks';
import {
  exerciseSessionSeries,
  listExerciseProgress,
  type ProgressMetric,
} from '../../../utils/exerciseProgress';

type Route = RouteProp<ProgressStackParamList, 'ExerciseProgressDetail'>;

const chartConfig = {
  backgroundColor: colors.neutral1,
  backgroundGradientFrom: colors.neutral1,
  backgroundGradientTo: colors.neutral1,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(174, 69, 31, ${opacity})`,
  labelColor: () => colors.neutral7,
  propsForBackgroundLines: { stroke: colors.neutral5, strokeDasharray: '' },
  style: { borderRadius: radius.sm },
};

const shortLabel = (date: string) => {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? date : `${d.getMonth() + 1}/${d.getDate()}`;
};
const summarizeSets = (sets: ExerciseSet[]) =>
  sets.map((s) => (s.weight > 0 ? `${s.weight}×${s.reps}` : `${s.reps} reps`)).join(', ');

const METRICS: { key: ProgressMetric; label: string; suffix: string }[] = [
  { key: 'weight', label: 'Max weight', suffix: 'kg' },
  { key: 'volume', label: 'Volume', suffix: '' },
];

export function ExerciseProgressDetailScreen() {
  const route = useRoute<Route>();
  const { exerciseId } = route.params;
  const getCurrentUserHistory = useTrainingHistoryStore((s) => s.getCurrentUserHistory);
  useTrainingHistoryStore((s) => s.history);
  const history = getCurrentUserHistory();

  const [metric, setMetric] = React.useState<ProgressMetric>('weight');

  const name = exerciseCatalog[exerciseId]?.name ?? `Exercise ${exerciseId}`;
  const series = React.useMemo(() => exerciseSessionSeries(history, exerciseId, metric), [history, exerciseId, metric]);
  const summary = React.useMemo(
    () => listExerciseProgress(history, exerciseCatalog).find((e) => e.exerciseId === exerciseId),
    [history, exerciseId],
  );
  const sessionLogs = React.useMemo(
    () =>
      history
        .map((t) => ({ date: t.date, logged: t.exercises.find((e) => e.exerciseId === exerciseId) }))
        .filter((x) => x.logged)
        .reverse(),
    [history, exerciseId],
  );

  const chartWidth = Dimensions.get('window').width - spacing.lg * 2 - spacing.md * 2;
  const suffix = METRICS.find((m) => m.key === metric)!.suffix;

  return (
    <View style={styles.container}>
      <ScreenHeader title={name} transparent />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {summary && (
          <View style={styles.statsRow}>
            <StatTile label="Best" value={summary.topWeight > 0 ? `${summary.topWeight}kg` : '—'} />
            <StatTile label="Est. 1RM" value={summary.best1RM > 0 ? `${summary.best1RM}kg` : '—'} />
            <StatTile label="Sessions" value={`${summary.sessions}`} />
          </View>
        )}

        {/* Metric toggle */}
        <View style={styles.toggle}>
          {METRICS.map((m) => {
            const active = m.key === metric;
            return (
              <TouchableOpacity
                key={m.key}
                onPress={() => setMetric(m.key)}
                style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {series.length >= 2 ? (
          <View style={styles.chartCard}>
            <LineChart
              data={{ labels: series.map((p) => shortLabel(p.date)), datasets: [{ data: series.map((p) => p.value) }] }}
              width={chartWidth}
              height={210}
              yAxisLabel=""
              yAxisSuffix={suffix}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        ) : (
          <Text style={styles.empty}>Log this exercise in at least two sessions to see a trend.</Text>
        )}

        <SectionTitle>Session log</SectionTitle>
        <View style={styles.list}>
          {sessionLogs.map((s, i) => (
            <View key={`${s.date}-${i}`} style={styles.logRow}>
              <Text style={styles.logDate}>{shortLabel(s.date)}</Text>
              <Text style={styles.logSets}>{summarizeSets(s.logged!.sets)}</Text>
            </View>
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
  content: { padding: spacing.lg, paddingBottom: spacing['2xl'] + spacing.tabBarInset, gap: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statTile: { flex: 1, backgroundColor: colors.cardBg, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', gap: 2 },
  statValue: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text },
  statLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  toggle: { flexDirection: 'row', backgroundColor: colors.neutral3, borderRadius: radius.pill, padding: 3, alignSelf: 'flex-start' },
  toggleBtn: { paddingHorizontal: spacing.lg, paddingVertical: 6, borderRadius: radius.pill },
  toggleBtnActive: { backgroundColor: colors.accent },
  toggleText: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  toggleTextActive: { color: colors.white, fontWeight: typography.weights.semibold },
  chartCard: { backgroundColor: colors.neutral1, borderRadius: radius.lg, padding: spacing.md },
  chart: { borderRadius: radius.sm },
  empty: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  list: { gap: spacing.xs },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.cardBg, borderRadius: radius.md, padding: spacing.md },
  logDate: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  logSets: { fontSize: typography.sizes.sm, color: colors.text, flex: 1, textAlign: 'right' },
});
