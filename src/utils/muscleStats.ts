import { MUSCLE_GROUPS, type MuscleGroup } from '../constants/muscles';
import type { CompletedTraining } from '../mocks';

export interface MuscleStat {
  /** Total tonnage = Σ (weight × reps) over every set hitting this muscle. */
  totalWeight: number;
  /** Number of logged-exercise occurrences targeting this muscle. */
  exerciseCount: number;
  /** Total sets across those exercises. */
  setCount: number;
}

export type MuscleStats = Record<MuscleGroup, MuscleStat>;

/** A fresh stats record with every group zeroed. */
export function emptyMuscleStats(): MuscleStats {
  return MUSCLE_GROUPS.reduce((acc, g) => {
    acc[g] = { totalWeight: 0, exerciseCount: 0, setCount: 0 };
    return acc;
  }, {} as MuscleStats);
}

/**
 * Aggregates per-muscle training stats from a list of completed trainings.
 *
 * Each logged exercise is attributed to *every* muscle group it targets (via
 * `lookup`), so a compound lift like the squat adds tonnage to quads, glutes,
 * hamstrings and core alike. Exercises absent from the lookup are skipped.
 */
export function computeMuscleStats(
  history: CompletedTraining[],
  lookup: Record<number, MuscleGroup[]>,
): MuscleStats {
  const stats = emptyMuscleStats();

  for (const training of history) {
    for (const logged of training.exercises) {
      const muscles = lookup[logged.exerciseId];
      if (!muscles || muscles.length === 0) continue;

      const tonnage = logged.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      const setCount = logged.sets.length;

      for (const muscle of muscles) {
        const entry = stats[muscle];
        entry.totalWeight += tonnage;
        entry.exerciseCount += 1;
        entry.setCount += setCount;
      }
    }
  }

  return stats;
}

export type IntensityMetric = keyof MuscleStat;

/**
 * Normalizes one stat field to 0..1 across all groups for the body-map heat-map.
 * When the chosen metric is uniformly zero (e.g. tonnage for a pure
 * bodyweight/cardio history) it falls back to `setCount` so worked muscles still
 * light up. Returns all zeros only when there is genuinely no data.
 */
export function toIntensities(
  stats: MuscleStats,
  metric: IntensityMetric = 'totalWeight',
): Record<MuscleGroup, number> {
  const valueOf = (g: MuscleGroup, m: IntensityMetric) => stats[g][m];

  let effectiveMetric = metric;
  let max = Math.max(...MUSCLE_GROUPS.map((g) => valueOf(g, metric)));
  if (max === 0 && metric !== 'setCount') {
    effectiveMetric = 'setCount';
    max = Math.max(...MUSCLE_GROUPS.map((g) => valueOf(g, 'setCount')));
  }

  return MUSCLE_GROUPS.reduce((acc, g) => {
    acc[g] = max === 0 ? 0 : valueOf(g, effectiveMetric) / max;
    return acc;
  }, {} as Record<MuscleGroup, number>);
}
