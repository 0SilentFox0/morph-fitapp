import { api } from './client';
import type { Query } from './client';
import { dataEnvelope, paginatedEnvelope } from '../../schemas/api/envelope';
import { ExerciseSchema } from '../../schemas/api/models';

export interface ExerciseInput {
  name: string;
  description?: string;
  muscle_groups?: string[];
  equipment?: string[];
  video_file_id?: string;
}

export const listExercises = (query?: Query) =>
  api.get('/exercises', { query, schema: paginatedEnvelope(ExerciseSchema) });

export const getExercise = (id: string) =>
  api.get(`/exercises/${id}`, { schema: dataEnvelope(ExerciseSchema) });

export const createExercise = (body: ExerciseInput) =>
  api.post('/exercises', { body, schema: dataEnvelope(ExerciseSchema) });

export const updateExercise = (id: string, body: Partial<ExerciseInput>) =>
  api.put(`/exercises/${id}`, { body, schema: dataEnvelope(ExerciseSchema) });

export const archiveExercise = (id: string) => api.post(`/exercises/${id}/archive`);
export const restoreExercise = (id: string) => api.post(`/exercises/${id}/restore`);
