import { dataEnvelope, paginatedEnvelope } from '../../schemas/api/envelope';
import {
  WorkoutLogExerciseSchema,
  WorkoutLogSchema,
  WorkoutLogSetSchema,
} from '../../schemas/api/models';
import type { Query } from './client';
import { api } from './client';

export interface AddWorkoutExerciseInput {
  exercise_id: string;
  name_snapshot: string;
  planned_sets?: number;
  planned_reps?: number;
  planned_weight_kg?: number;
}

export interface LogSetInput {
  workout_log_exercise_id: string;
  exercise_id: string;
  set_index: number;
  reps: number;
  weight_kg: number;
  rest_seconds?: number;
  client_uuid: string;
}

export const startWorkout = (sessionId: string) =>
  api.post(`/sessions/${sessionId}/workout`, {
    schema: dataEnvelope(WorkoutLogSchema),
  });

export const listWorkoutLogs = (query?: Query) =>
  api.get('/workout-logs', {
    query,
    schema: paginatedEnvelope(WorkoutLogSchema),
  });

export const getWorkoutLog = (id: string) =>
  api.get(`/workout-logs/${id}`, { schema: dataEnvelope(WorkoutLogSchema) });

export const addWorkoutExercise = (
  logId: string,
  body: AddWorkoutExerciseInput
) =>
  api.post(`/workout-logs/${logId}/exercises`, {
    body,
    schema: dataEnvelope(WorkoutLogExerciseSchema),
  });

export const finishWorkout = (logId: string) =>
  api.post(`/workout-logs/${logId}/finish`, {
    schema: dataEnvelope(WorkoutLogSchema),
  });

export const logSet = (logId: string, body: LogSetInput) =>
  api.post(`/workout-logs/${logId}/sets`, {
    body,
    schema: dataEnvelope(WorkoutLogSetSchema),
  });

export const updateSet = (
  setId: string,
  body: { reps?: number; weight_kg?: number; rest_seconds?: number }
) =>
  api.put(`/workout-log-sets/${setId}`, {
    body,
    schema: dataEnvelope(WorkoutLogSetSchema),
  });

export const deleteSet = (setId: string) =>
  api.delete(`/workout-log-sets/${setId}`);
