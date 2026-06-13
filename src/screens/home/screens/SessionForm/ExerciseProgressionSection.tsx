import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTrainingHistoryStore } from '../../../../store/trainingHistoryStore';
import { applyProgression, PROGRESSION_STEPS } from '../../../../utils';
import type { TrainingProgram, ExerciseSet } from '../../../../mocks';
import { colors } from '../../../../theme/colors';
import { radius } from '../../../../theme';
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';

interface ExerciseProgressionSectionProps {
  program: TrainingProgram;
  /** The single participant's name (Personal sessions only). */
  clientName: string;
  /** Emits the resolved target sets per exercise id whenever inputs change. */
  onChange: (plannedSets: Record<number, ExerciseSet[]>) => void;
}

type PctState = Record<number, { weightPct: number; repsPct: number }>;

/**
 * Per-exercise progression for session creation: pre-fills each exercise from
 * the client's previous training (falling back to the program template) and
 * lets the trainer bump weight and reps independently by 5/10/15%.
 */
export function ExerciseProgressionSection({
  program,
  clientName,
  onChange,
}: ExerciseProgressionSectionProps) {
  const getLastSets = useTrainingHistoryStore((s) => s.getLastSets);
  const exercises = program.exercises ?? [];

  // Base = previous training values, else the program template.
  const bases = React.useMemo(() => {
    const map: Record<number, ExerciseSet[]> = {};
    for (const ex of program.exercises ?? []) {
      map[ex.id] = getLastSets(clientName, ex.id) ?? ex.sets;
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program.id, clientName]);

  const [pct, setPct] = React.useState<PctState>({});

  React.useEffect(() => {
    setPct({});
  }, [program.id, clientName]);

  React.useEffect(() => {
    const planned: Record<number, ExerciseSet[]> = {};
    for (const ex of program.exercises ?? []) {
      const p = pct[ex.id] ?? { weightPct: 0, repsPct: 0 };
      planned[ex.id] = applyProgression(bases[ex.id] ?? ex.sets, p.weightPct, p.repsPct);
    }
    onChange(planned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bases, pct]);

  const setExercisePct = (id: number, key: 'weightPct' | 'repsPct', value: number) =>
    setPct((prev) => ({
      ...prev,
      [id]: { weightPct: 0, repsPct: 0, ...prev[id], [key]: value },
    }));

  if (exercises.length === 0) return null;

  return (
    <View>
      <Text style={styles.sectionLabel}>Progression</Text>
      {exercises.map((ex) => {
        const base = bases[ex.id] ?? ex.sets;
        const p = pct[ex.id] ?? { weightPct: 0, repsPct: 0 };
        const baseTop = base[0];
        const afterTop = baseTop
          ? applyProgression([baseTop], p.weightPct, p.repsPct)[0]
          : undefined;
        return (
          <View key={ex.id} style={styles.card}>
            <Text style={styles.exName}>{ex.name}</Text>
            {baseTop && afterTop && (
              <Text style={styles.preview}>
                prev {baseTop.weight}×{baseTop.reps} → {afterTop.weight} kg × {afterTop.reps}
              </Text>
            )}
            <ChipRow
              label="Weight"
              value={p.weightPct}
              onSelect={(v) => setExercisePct(ex.id, 'weightPct', v)}
            />
            <ChipRow
              label="Reps"
              value={p.repsPct}
              onSelect={(v) => setExercisePct(ex.id, 'repsPct', v)}
            />
          </View>
        );
      })}
    </View>
  );
}

function ChipRow({
  label,
  value,
  onSelect,
}: {
  label: string;
  value: number;
  onSelect: (value: number) => void;
}) {
  return (
    <View style={styles.chipRow}>
      <Text style={styles.chipLabel}>{label}</Text>
      {PROGRESSION_STEPS.map((step) => {
        const active = value === step;
        return (
          <TouchableOpacity
            key={step}
            onPress={() => onSelect(step)}
            style={[styles.chip, active && styles.chipActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {step === 0 ? '=' : `+${step}%`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  exName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  preview: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  chipLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    width: 52,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.neutral5,
    backgroundColor: colors.neutral1,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
  },
});
