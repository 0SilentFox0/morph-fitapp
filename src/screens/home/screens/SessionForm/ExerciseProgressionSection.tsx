import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import theme from '../../../../theme';
import type { ExerciseSet, TrainingProgram } from '../../../../types';
import { applyProgression, PROGRESSION_STEPS } from '../../../../utils';

const { colors, radius, typography, spacing } = theme;

import { useExerciseProgression } from './useExerciseProgression';

interface ExerciseProgressionSectionProps {
  program: TrainingProgram;
  /** The single participant's name (Personal sessions only). */
  clientName: string;
  /** Emits the resolved target sets per exercise id whenever inputs change. */
  onChange: (plannedSets: Record<number, ExerciseSet[]>) => void;
}

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
  const { exercises, bases, pct, setExercisePct } = useExerciseProgression(
    program,
    clientName,
    onChange
  );

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
                prev {baseTop.weight}×{baseTop.reps} → {afterTop.weight} kg ×{' '}
                {afterTop.reps}
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
