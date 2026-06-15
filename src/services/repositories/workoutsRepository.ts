import { apiReadiness } from '../../config/apiReadiness';
import type {
  WorkoutLog,
  WorkoutLogExercise,
  WorkoutLogSet,
} from '../../schemas/api/models';
import type { ExerciseSet } from '../../types';
import type {
  AddWorkoutExerciseInput,
  LogSetInput,
} from '../api/workouts';
import * as workoutsApi from '../api/workouts';
import { withMockFallback } from '../mockFallback';

/**
 * Workout-logging pipeline against the live backend:
 *   startWorkout(sessionId) → addExercise(logId) → logSet(logId) → finishWorkout(logId)
 *
 * Lives behind the `workouts` readiness flag. NOTE: the live path needs real
 * server ids (session UUID, exercise UUID, client UUID, workout_log_exercise
 * UUID). Those only exist once sessions/programs/clients are API-backed (P1.1),
 * so today this is dormant — the active-training store only invokes it when a
 * server `sessionId`/`workoutLogId` is present, leaving the current mock flow
 * untouched.
 */

const nonNeg = (n: number): number => (Number.isFinite(n) && n > 0 ? n : 0);

/** Pure adapter: an editable in-session set → the API `LogSetInput`. */
export function toLogSetInput(args: {
  workoutLogExerciseId: string;
  exerciseId: string;
  setIndex: number;
  clientUuid: string;
  set: ExerciseSet;
  restSeconds?: number;
}): LogSetInput {
  return {
    workout_log_exercise_id: args.workoutLogExerciseId,
    exercise_id: args.exerciseId,
    set_index: args.setIndex,
    reps: nonNeg(args.set.reps),
    weight_kg: nonNeg(args.set.weight),
    client_uuid: args.clientUuid,
    ...(args.restSeconds != null ? { rest_seconds: args.restSeconds } : {}),
  };
}

export async function startWorkout(sessionId: string): Promise<WorkoutLog> {
  return withMockFallback(
    apiReadiness.workouts,
    async () => (await workoutsApi.startWorkout(sessionId)).data,
    () =>
      ({
        id: `mock-log-${sessionId}`,
        session_id: sessionId,
        exercises: [],
      }) as WorkoutLog
  );
}

export async function addExercise(
  logId: string,
  input: AddWorkoutExerciseInput
): Promise<WorkoutLogExercise> {
  return withMockFallback(
    apiReadiness.workouts,
    async () => (await workoutsApi.addWorkoutExercise(logId, input)).data,
    () =>
      ({
        id: `mock-wle-${input.exercise_id}`,
        exercise_id: input.exercise_id,
        order: 0,
        name_snapshot: input.name_snapshot,
        sets: [],
      }) as WorkoutLogExercise
  );
}

export async function logSet(
  logId: string,
  input: LogSetInput
): Promise<WorkoutLogSet> {
  return withMockFallback(
    apiReadiness.workouts,
    async () => (await workoutsApi.logSet(logId, input)).data,
    () =>
      ({
        id: `mock-set-${input.workout_log_exercise_id}-${input.set_index}`,
        workout_log_exercise_id: input.workout_log_exercise_id,
        exercise_id: input.exercise_id,
        set_index: input.set_index,
        reps: input.reps,
        weight_kg: input.weight_kg,
        actor_user_id: input.client_uuid,
        is_pr: false,
        client_uuid: input.client_uuid,
        version: 1,
      }) as WorkoutLogSet
  );
}

export async function finishWorkout(logId: string): Promise<WorkoutLog> {
  return withMockFallback(
    apiReadiness.workouts,
    async () => (await workoutsApi.finishWorkout(logId)).data,
    () => ({ id: logId, session_id: 'mock', exercises: [] }) as WorkoutLog
  );
}
