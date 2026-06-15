/**
 * Progress overview pipeline — turns a client's completed-training history into
 * the per-muscle heatmap intensities, session totals, and ranked top muscles
 * shown on the progress dashboard.
 */

import type { MuscleGroup } from '../../constants/muscles';
import { MUSCLE_GROUPS } from '../../constants/muscles';
import type { CompletedTraining } from '../../types';
import {
  computeMuscleStats,
  toIntensities,
  computeTotals,
  filterByTimeframe,
  type MuscleStat,
  type MuscleStats,
  type SessionTotals,
  type Timeframe,
} from './muscleStats';

export interface RankedMuscle {
  group: MuscleGroup;
  stat: MuscleStat;
}

export interface ProgressOverview {
  intensities: ReturnType<typeof toIntensities>;
  totals: SessionTotals;
  topMuscles: RankedMuscle[];
}

/** Muscle groups with at least one logged exercise, heaviest tonnage first. */
export function rankMuscles(stats: MuscleStats): RankedMuscle[] {
  return MUSCLE_GROUPS.filter((g) => stats[g].exerciseCount > 0)
    .sort((a, b) => stats[b].totalWeight - stats[a].totalWeight)
    .map((group) => ({ group, stat: stats[group] }));
}

export function computeProgressOverview(
  history: CompletedTraining[],
  muscleMap: Record<number, MuscleGroup[]>,
  timeframe: Timeframe,
  now: Date = new Date(),
): ProgressOverview {
  const filtered = filterByTimeframe(history, timeframe, now);
  const stats = computeMuscleStats(filtered, muscleMap);
  return {
    intensities: toIntensities(stats),
    totals: computeTotals(filtered),
    topMuscles: rankMuscles(stats),
  };
}
