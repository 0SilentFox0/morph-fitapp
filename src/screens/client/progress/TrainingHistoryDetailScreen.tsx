import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { type RouteProp, useRoute } from '@react-navigation/native';

import { ScreenHeader } from '../../../components/layout';
import { EmptyState, SectionTitle, Tag } from '../../../components/ui';
import type { ProgressStackParamList } from '../../../navigation/types';
import theme from '../../../theme';
import { formatKg } from '../../../utils';

const { colors, radius, typography, spacing } = theme;

import { MUSCLE_LABELS, type MuscleGroup } from '../../../constants/muscles';
import {
  exerciseCatalog,
  exerciseMuscleMap,
  mockTrainingPrograms,
} from '../../../mocks';
import { useTrainingHistoryStore } from '../../../store/trainingHistoryStore';
import type { ExerciseSet } from '../../../types';
import { formatDate } from '../../../utils';
import { computeTotals } from '../../../utils/progress/muscleStats';

type Route = RouteProp<ProgressStackParamList, 'TrainingHistoryDetail'>;

const summarizeSets = (sets: ExerciseSet[]) =>
  sets
    .map((s) => (s.weight > 0 ? `${s.weight}×${s.reps}` : `${s.reps} reps`))
    .join(', ');

export function TrainingHistoryDetailScreen() {
  const route = useRoute<Route>();

  const { trainingId } = route.params;

  const history = useTrainingHistoryStore((s) => s.history);

  const training = history.find((t) => t.id === trainingId);

  if (!training) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Training" transparent />
        <View style={styles.emptyWrap}>
          <EmptyState icon="alert-circle-outline" title="Training not found" />
        </View>
      </View>
    );
  }

  const totals = computeTotals([training]);

  const program = mockTrainingPrograms.find((p) => p.id === training.programId);

  const musclesWorked = Array.from(
    new Set(
      training.exercises.flatMap((e) => exerciseMuscleMap[e.exerciseId] ?? [])
    )
  ) as MuscleGroup[];

  return (
    <View style={styles.container}>
      <ScreenHeader title={program?.name ?? 'Training'} transparent />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.date}>
          {formatDate(training.date) || training.date}
        </Text>

        <View style={styles.statsRow}>
          <StatTile label="Volume" value={formatKg(totals.tonnage)} />
          <StatTile label="Exercises" value={`${totals.exerciseCount}`} />
          <StatTile label="Sets" value={`${totals.setCount}`} />
        </View>

        {musclesWorked.length > 0 && (
          <>
            <SectionTitle>Muscles worked</SectionTitle>
            <View style={styles.tagsRow}>
              {musclesWorked.map((m) => (
                <Tag key={m} label={MUSCLE_LABELS[m]} variant="default" />
              ))}
            </View>
          </>
        )}

        <SectionTitle>Exercises</SectionTitle>
        <View style={styles.exerciseList}>
          {training.exercises.map((ex, i) => (
            <View key={`${ex.exerciseId}-${i}`} style={styles.exerciseRow}>
              <Text style={styles.exerciseName}>
                {exerciseCatalog[ex.exerciseId]?.name ??
                  `Exercise ${ex.exerciseId}`}
              </Text>
              <Text style={styles.exerciseSets}>{summarizeSets(ex.sets)}</Text>
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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
    gap: spacing.md,
  },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  date: { fontSize: typography.sizes.sm, color: colors.textSecondary },
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
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  exerciseList: { gap: spacing.xs },
  exerciseRow: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  exerciseName: {
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  exerciseSets: { fontSize: typography.sizes.sm, color: colors.textSecondary },
});
