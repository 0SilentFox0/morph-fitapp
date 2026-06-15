import type { CompletedTraining } from '../../types';

export interface PersonalRecord {
  exerciseId: number;
  /** Heaviest single set (kg); 0 for purely bodyweight exercises. */
  maxWeight: number;
  /** Reps performed at the heaviest set. */
  repsAtMaxWeight: number;
  /** Most reps in a single set. */
  maxReps: number;
  /** Best estimated one-rep max (Epley), rounded to whole kg; 0 for bodyweight. */
  best1RM: number;
}

/** Epley estimated 1RM: weight × (1 + reps/30). */
function epley(weight: number, reps: number): number {
  if (weight <= 0) return 0;

  return weight * (1 + reps / 30);
}

/**
 * Per-exercise personal records across a training history. Includes every
 * exercise that appears at least once. Sorted by best estimated 1RM (desc),
 * then by max reps (desc) so bodyweight feats still surface.
 */
export function computePRs(history: CompletedTraining[]): PersonalRecord[] {
  const byExercise = new Map<number, PersonalRecord>();

  for (const training of history) {
    for (const logged of training.exercises) {
      const pr = byExercise.get(logged.exerciseId) ?? {
        exerciseId: logged.exerciseId,
        maxWeight: 0,
        repsAtMaxWeight: 0,
        maxReps: 0,
        best1RM: 0,
      };

      for (const set of logged.sets) {
        if (set.weight > pr.maxWeight) {
          pr.maxWeight = set.weight;
          pr.repsAtMaxWeight = set.reps;
        }

        if (set.reps > pr.maxReps) pr.maxReps = set.reps;

        const oneRm = epley(set.weight, set.reps);

        if (oneRm > pr.best1RM) pr.best1RM = oneRm;
      }

      byExercise.set(logged.exerciseId, pr);
    }
  }

  return Array.from(byExercise.values())
    .map((pr) => ({ ...pr, best1RM: Math.round(pr.best1RM) }))
    .sort((a, b) => b.best1RM - a.best1RM || b.maxReps - a.maxReps);
}
