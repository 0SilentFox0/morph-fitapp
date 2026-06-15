import type { ExerciseSet, ProgramExercise } from '../../types';

/** The heaviest logged set — the representative row for an exercise. */
export function topSet(sets: ExerciseSet[]): ExerciseSet | undefined {
  return sets.reduce<ExerciseSet | undefined>(
    (best, s) => (!best || s.weight > best.weight ? s : best),
    undefined,
  );
}

/** Sum the "Nm"/"N min" durations across exercises into a "30m"-style label. */
export function totalDurationLabel(exercises: ProgramExercise[]): string {
  const minutes = exercises.reduce((sum, ex) => {
    const m = ex.durationLabel?.match(/(\d+)\s*m/);
    return sum + (m ? Number(m[1]) : 0);
  }, 0);
  return minutes > 0 ? `${minutes}m` : '—';
}
