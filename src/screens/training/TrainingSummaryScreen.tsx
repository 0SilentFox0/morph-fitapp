import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getChartWidth } from '../../utils/common/layout';
import { LineChart } from 'react-native-chart-kit';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { LiveTrainingParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/layout';
import { Card, SectionTitle } from '../../components/ui';
import { ExercisesTable } from './components/ExercisesTable';
import { useActiveTrainingStore } from '../../store/activeTrainingStore';
import { useTrainingHistoryStore } from '../../store/trainingHistoryStore';
import { trainingMetric } from '../../utils';
import { topSet, totalDurationLabel } from '../../utils/training/trainingSummary';
import { mockTrainingPrograms } from '../../mocks';
import theme from '../../theme';
const { colors, createChartConfig, radius, typography, spacing } = theme;

type Route = RouteProp<LiveTrainingParamList, 'TrainingSummary'>;
type Nav = NativeStackNavigationProp<LiveTrainingParamList, 'TrainingSummary'>;

const TABS = ['Summary', 'Exercises'];
const TIMEFRAME = ['Week', 'Month', 'Custom'];

const CHART_WIDTH = getChartWidth(20);

const chartConfig = createChartConfig();

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
            <Text style={styles.summaryValue}>{totalDurationLabel(exercises)}</Text>
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
        <ExercisesTable rows={rows} />

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
