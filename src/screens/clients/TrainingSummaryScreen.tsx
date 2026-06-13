import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ClientsStackParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/layout';
import { Card, SectionTitle } from '../../components/ui';
import { useActiveTrainingStore } from '../../store/activeTrainingStore';
import { mockTrainingPrograms } from '../../mocks';
import type { ExerciseSet, ProgramExercise } from '../../mocks';
import { colors } from '../../theme/colors';
import { radius } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type Route = RouteProp<ClientsStackParamList, 'TrainingSummary'>;

const TABS = ['Summary', 'Exercises'];
const TIMEFRAME = ['Week', 'Month', 'Custom'];

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
  const insets = useSafeAreaInsets();
  const clientId = route.params?.clientId;
  const [activeTab, setActiveTab] = React.useState(0);
  const [timeframe, setTimeframe] = React.useState(0);

  const client = useActiveTrainingStore(
    (s) => s.clients.find((c) => c.clientId === clientId) ?? s.clients[0] ?? null,
  );
  const program =
    mockTrainingPrograms.find((p) => p.id === client?.programId) ?? mockTrainingPrograms[0]!;
  const exercises = program.exercises ?? [];

  const rows = exercises.map((ex) => {
    const sets = client?.setLog[ex.id] ?? ex.sets;
    const top = topSet(sets);
    return {
      id: ex.id,
      name: ex.name,
      weight: top ? `${top.weight}kg` : '—',
      sets: sets.length,
      reps: top ? top.reps : 0,
    };
  });

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Training Summary"
        rightElement={
          <View style={styles.headerRight}>
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
            <Text style={styles.summaryValue}>{program.tag}</Text>
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

        {/* TODO chart: render real progress chart when analytics are available. */}
        <View style={styles.chartPlaceholder} />

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
