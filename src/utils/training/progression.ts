import type { CompletedTraining, ExerciseSet } from '../../types';

/** Progression percentages offered at session creation. */
export const PROGRESSION_STEPS = [0, 5, 10, 15] as const;
export type ProgressionPct = (typeof PROGRESSION_STEPS)[number];

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * Applies independent weight/reps progression to a set of logged values.
 * Weight rounds to the nearest 0.5 kg, reps to a whole number. A 0 value
 * (e.g. bodyweight/cardio) stays 0.
 */
export function applyProgression(
  sets: ExerciseSet[],
  weightPct: number,
  repsPct: number
): ExerciseSet[] {
  const wf = 1 + weightPct / 100;

  const rf = 1 + repsPct / 100;

  return sets.map((s) => ({
    ...s,
    weight: roundTo(s.weight * wf, 0.5),
    reps: Math.round(s.reps * rf),
  }));
}

/** Blended progress metric per training: volume (weight×reps), or reps for bodyweight/cardio. */
export function trainingMetric(t: CompletedTraining): number {
  return t.exercises.reduce(
    (sum, ex) =>
      sum +
      ex.sets.reduce(
        (s, set) => s + (set.weight > 0 ? set.weight * set.reps : set.reps),
        0
      ),
    0
  );
}
