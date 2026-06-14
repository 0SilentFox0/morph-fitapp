import type { TrainingProgram, ProgramExercise } from '../types';

/**
 * Flattens all program exercises into a deduped catalog (by exercise id, first
 * occurrence wins) — the pool a client picks from when building a custom workout.
 */
export function buildExerciseCatalog(programs: TrainingProgram[]): ProgramExercise[] {
  const byId = new Map<number, ProgramExercise>();
  for (const program of programs) {
    for (const ex of program.exercises ?? []) {
      if (!byId.has(ex.id)) byId.set(ex.id, ex);
    }
  }
  return [...byId.values()];
}
