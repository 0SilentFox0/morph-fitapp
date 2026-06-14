import type { CompletedTraining, ExerciseInfo } from '../types';

export type ProgressMetric = 'weight' | 'volume';

export interface ExerciseSummary {
  exerciseId: number;
  name: string;
  /** Number of sessions the exercise appears in. */
  sessions: number;
  /** Heaviest single set across all sessions (kg). */
  topWeight: number;
  /** Best estimated 1RM (Epley), rounded; 0 for bodyweight. */
  best1RM: number;
  /** Most recent session date the exercise was performed. */
  lastDate: string;
}

export interface ProgressPoint {
  date: string;
  value: number;
}

function epley(weight: number, reps: number): number {
  return weight <= 0 ? 0 : weight * (1 + reps / 30);
}

/** Per-session value for one exercise: top-set weight, or total volume. */
function sessionValue(sets: { weight: number; reps: number }[], metric: ProgressMetric): number {
  if (metric === 'weight') return sets.reduce((max, s) => Math.max(max, s.weight), 0);
  return sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
}

/**
 * One summary row per exercise that appears in the history, ordered by most
 * recently performed (the input is oldest → newest, so later wins on ties).
 */
export function listExerciseProgress(
  history: CompletedTraining[],
  catalog: Record<number, ExerciseInfo>,
): ExerciseSummary[] {
  const byId = new Map<number, ExerciseSummary>();
  let order = 0;
  const lastSeen = new Map<number, number>();

  for (const training of history) {
    for (const logged of training.exercises) {
      const prev =
        byId.get(logged.exerciseId) ??
        {
          exerciseId: logged.exerciseId,
          name: catalog[logged.exerciseId]?.name ?? `Exercise ${logged.exerciseId}`,
          sessions: 0,
          topWeight: 0,
          best1RM: 0,
          lastDate: training.date,
        };
      prev.sessions += 1;
      prev.lastDate = training.date;
      for (const s of logged.sets) {
        if (s.weight > prev.topWeight) prev.topWeight = s.weight;
        const rm = epley(s.weight, s.reps);
        if (rm > prev.best1RM) prev.best1RM = rm;
      }
      byId.set(logged.exerciseId, prev);
      lastSeen.set(logged.exerciseId, order++);
    }
  }

  return Array.from(byId.values())
    .map((s) => ({ ...s, best1RM: Math.round(s.best1RM) }))
    .sort((a, b) => (lastSeen.get(b.exerciseId)! - lastSeen.get(a.exerciseId)!));
}

/** Per-session series for one exercise (only sessions that include it), chronological. */
export function exerciseSessionSeries(
  history: CompletedTraining[],
  exerciseId: number,
  metric: ProgressMetric,
): ProgressPoint[] {
  const points: ProgressPoint[] = [];
  for (const training of history) {
    const logged = training.exercises.find((e) => e.exerciseId === exerciseId);
    if (!logged) continue;
    points.push({ date: training.date, value: sessionValue(logged.sets, metric) });
  }
  return points;
}

/** Total training volume (Σ weight×reps) per session over time — overall progress dynamics. */
export function overallVolumeSeries(history: CompletedTraining[]): ProgressPoint[] {
  return history.map((training) => ({
    date: training.date,
    value: training.exercises.reduce(
      (sum, e) => sum + e.sets.reduce((s, set) => s + set.weight * set.reps, 0),
      0,
    ),
  }));
}
