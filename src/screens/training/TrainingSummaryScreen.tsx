import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getChartWidth } from '../../utils/layout';
import { LineChart } from 'react-native-chart-kit';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { LiveTrainingParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/layout';
import { Card, SectionTitle } from '../../components/ui';
import { useActiveTrainingStore } from '../../store/activeTrainingStore';
import { useTrainingHistoryStore } from '../../store/trainingHistoryStore';
import { trainingMetric } from '../../utils';
import { mockTrainingPrograms } from '../../mocks';
import type { ExerciseSet, ProgramExercise } from '../../types';
import { colors } from '../../theme/colors';
import { radius } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type Route = RouteProp<LiveTrainingParamList, 'TrainingSummary'>;
type Nav = NativeStackNavigationProp<LiveTrainingParamList, 'TrainingSummary'>;

const TABS = ['Summary', 'Exercises'];
const TIMEFRAME = ['Week', 'Month', 'Custom'];

const CHART_WIDTH = getChartWidth(20);

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

/** Picks the heaviest logged set as the representative row for an exercise. */
function topSet(sets: ExerciseSet[]): ExerciseSet | undefined {
  return sets.reduce<ExerciseSet | undefined>(
    (best, s) => (!best || s.weight > best.weight ? s : best),
    undefined,
  );
}

function durationLabel(exercises: ProgramExercise[]): string {
  const minutes = exercises.reduce((sum, ex) => {
    const m = ex.durationLabel?.match(/(\d+)\s*m/);
    return sum + (m ? Number(m[1]) : 0);
  }, 0);
  return minutes > 0 ? `${minutes}m` : '—';
}

export function TrainingSummaryScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const participantId = route.params?.participantId;
  const [activeTab, setActiveTab] = React.useState(0);
  const [timeframe, setTimeframe] = React.useState(0);

  const participant = useActiveTrainingStore(
    (s) => s.participants.find((c) => c.participantId === participantId) ?? s.participants[0] ?? null,
  );
  const addCompletedTraining = useTrainingHistoryStore((s) => s.addCompletedTraining);
  const endTraining = useActiveTrainingStore((s) => s.endTraining);
  const getClientHistory = useTrainingHistoryStore((s) => s.getClientHistory);
  // label-only: exercises come from participant.exercises, this is just for the type tag
  const program = participant?.programId
    ? mockTrainingPrograms.find((p) => p.id === participant.programId)
    : undefined;
  const exercises = participant?.exercises ?? [];
  const typeLabel = program?.tag ?? 'Custom';

  const history = participant ? getClientHistory(participant.name) : [];
  const chartData =
    history.length > 0
      ? {
          labels: history.map((h) => h.date),
          datasets: [{ data: history.map(trainingMetric) }],
        }
      : null;

  const rows = exercises.map((ex) => {
    const sets = participant?.setLog[ex.id] ?? ex.sets;
    const top = topSet(sets);
    return {
      id: ex.id,
      name: ex.name,
      weight: top ? `${top.weight}kg` : '—',
      sets: sets.length,
      reps: top ? top.reps : 0,
    };
  });

  const doneRef = React.useRef(false);
  const handleDone = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (participant) {
      addCompletedTraining({
        id: `ct-${participant.participantId}-${Date.now()}`,
        clientName: participant.name,
        programId: participant.programId ?? 'custom',
        date: 'Today',
        exercises: participant.exercises.map((ex) => ({
          exerciseId: ex.id,
          sets: (participant.setLog[ex.id] ?? ex.sets).map((s) => ({ ...s })),
        })),
      });
    }
    endTraining();
    navigation.popToTop();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Training Summary"
        rightElement={
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleDone} hitSlop={8}>
              <Text style={{ color: colors.accent, fontWeight: typography.weights.semibold, fontSize: typography.sizes.base }}>
                Done
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="pencil" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{durationLabel(exercises)}</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Type</Text>
            <Text style={styles.summaryValue}>{typeLabel}</Text>
          </Card>
        </View>

        <SectionTitle>Training progress</SectionTitle>
        <View style={styles.timeframeRow}>
          {TIMEFRAME.map((t, i) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTimeframe(i)}
              style={[styles.timeframeBtn, i === timeframe && styles.timeframeBtnActive]}
            >
              <Text style={[styles.timeframeText, i === timeframe && styles.timeframeTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {chartData ? (
          <View style={styles.chartCard}>
            <LineChart
              data={chartData}
              width={CHART_WIDTH}
              height={180}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        ) : (
          <View style={styles.chartPlaceholder} />
        )}

        <SectionTitle>Exercises</SectionTitle>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableHeader]}>Name</Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Weight</Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Sets</Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Reps</Text>
          </View>
          {rows.map((r, i) => (
            <View key={r.id} style={[styles.tableRow, i % 2 === 0 && styles.tableRowHighlight]}>
              <Text style={styles.tableCell}>{r.name}</Text>
              <Text style={styles.tableCell}>{r.weight}</Text>
              <Text style={styles.tableCell}>{r.sets}</Text>
              <Text style={styles.tableCell}>{r.reps}</Text>
            </View>
          ))}
        </View>

        <SectionTitle>Trainer Notes</SectionTitle>
        <Card style={styles.notesCard}>
          <Text style={styles.notesText}>
            {exercises[0]?.trainerNotes ?? 'No notes recorded for this session.'}
          </Text>
        </Card>
      </ScrollView>

      <View style={[styles.tabBar, { paddingBottom: spacing.md + insets.bottom }]}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            onPress={() => setActiveTab(i)}
            style={[styles.tab, i === activeTab && styles.tabActive]}
          >
            <Text style={[styles.tabText, i === activeTab && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  timeframeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  timeframeBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral2,
  },
  timeframeBtnActive: {
    backgroundColor: colors.accent,
  },
  timeframeText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  timeframeTextActive: {
    color: colors.white,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  chartCard: {
    backgroundColor: colors.neutral1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  chart: {
    borderRadius: radius.sm,
  },
  table: {
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  tableRow: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  tableRowHighlight: {
    backgroundColor: colors.primary2,
  },
  tableCell: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  tableHeader: {
    fontWeight: typography.weights.semibold,
  },
  notesCard: {
    marginBottom: spacing.lg,
  },
  notesText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.neutral1,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  tabText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
});
