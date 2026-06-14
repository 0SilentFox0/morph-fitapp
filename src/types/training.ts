/**
 * Training domain models: exercises, sets, programs, and completed trainings.
 * Pure types — no runtime data. Mock data lives in src/mocks.
 */

import type { MuscleGroup } from '../constants/muscles';

export type SetNote = 'regular' | 'failure' | 'dropset' | 'short_rest' | 'long_rest';

export interface ExerciseSet {
  weight: number;
  reps: number;
  note?: SetNote;
}

export interface ProgramExercise {
  id: number;
  name: string;
  category: string;
  imageUrl: string | null;
  sets: ExerciseSet[];
  /** Short duration label shown in exercise lists, e.g. "5m". */
  durationLabel?: string;
  /** Free-text guidance shown on the live Exercise screen. */
  trainerNotes?: string;
  /** Muscle groups this exercise loads — source of the per-muscle progress stats. */
  muscles?: MuscleGroup[];
}

export interface TrainingProgram {
  id: string;
  name: string;
  tag: string;
  videoCount: number;
  views: number;
  likes: number;
  thumbnail?: string;
  /** e.g. "$5/month" */
  price?: string;
  description?: string;
  exercises?: ProgramExercise[];
}

/** Minimal per-exercise reference info, derived from the program definitions. */
export interface ExerciseInfo {
  id: number;
  name: string;
  category: string;
  muscles: MuscleGroup[];
}

/** A client's logged sets for one exercise in a past (completed) training. */
export interface LoggedExercise {
  exerciseId: number;
  sets: ExerciseSet[];
}

/** A past training a client completed — source of "previous metrics". */
export interface CompletedTraining {
  id: string;
  /** Keyed by client display name (ids differ between mocks and the form). */
  clientName: string;
  programId: string;
  date: string;
  exercises: LoggedExercise[];
}
