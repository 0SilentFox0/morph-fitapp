import { MUSCLE_GROUPS, type MuscleGroup } from '../../constants/muscles';
import type { CompletedTraining } from '../../types';

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

export interface SessionTotals {
  tonnage: number;
  exerciseCount: number;
  setCount: number;
  sessionCount: number;
}

/** Overall totals across a history (no per-muscle double counting). */
export function computeTotals(history: CompletedTraining[]): SessionTotals {
  let tonnage = 0;
  let exerciseCount = 0;
  let setCount = 0;
  for (const training of history) {
    for (const logged of training.exercises) {
      exerciseCount += 1;
      setCount += logged.sets.length;
      tonnage += logged.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    }
  }
  return { tonnage, exerciseCount, setCount, sessionCount: history.length };
}

export interface TrendPoint {
  date: string;
  tonnage: number;
}

/**
 * Per-training tonnage attributed to one muscle, for the trend chart. Includes
 * only trainings that actually worked the muscle, in chronological (input) order.
 */
export function muscleTrend(
  history: CompletedTraining[],
  muscle: MuscleGroup,
  lookup: Record<number, MuscleGroup[]>,
): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (const training of history) {
    let tonnage = 0;
    let worked = false;
    for (const logged of training.exercises) {
      if (!lookup[logged.exerciseId]?.includes(muscle)) continue;
      worked = true;
      tonnage += logged.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    }
    if (worked) points.push({ date: training.date, tonnage });
  }
  return points;
}

export type Timeframe = 'session' | 'week' | 'all';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Narrows a chronological (oldest → newest) history to a timeframe:
 * - `session`: just the most recent training
 * - `week`: trainings within 7 days of `now` (falls back to the parseable subset)
 * - `all`: everything
 */
export function filterByTimeframe(
  history: CompletedTraining[],
  timeframe: Timeframe,
  now: Date,
): CompletedTraining[] {
  if (timeframe === 'all') return history;
  if (timeframe === 'session') {
    return history.length ? [history[history.length - 1]!] : [];
  }
  const cutoff = now.getTime() - WEEK_MS;
  return history.filter((h) => {
    const t = new Date(h.date).getTime();
    return !Number.isNaN(t) && t >= cutoff;
  });
}
