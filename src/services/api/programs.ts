import { api } from './client';
import type { Query } from './client';
import { dataEnvelope, paginatedEnvelope } from '../../schemas/api/envelope';
import { ProgramSchema } from '../../schemas/api/models';

export interface ProgramExerciseInput {
  exercise_id: string;
  order: number;
  sets: number;
  reps: number;
  weight_kg?: number;
  rest_seconds?: number;
  notes?: string;
}

export interface ProgramInput {
  name: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_min?: number;
  cover_file_id?: string;
  exercises?: ProgramExerciseInput[];
}

export const listPrograms = (query?: Query) =>
  api.get('/programs', { query, schema: paginatedEnvelope(ProgramSchema) });

export const getProgram = (id: string) =>
  api.get(`/programs/${id}`, { schema: dataEnvelope(ProgramSchema) });

export const createProgram = (body: ProgramInput) =>
  api.post('/programs', { body, schema: dataEnvelope(ProgramSchema) });

export const updateProgram = (id: string, body: Partial<ProgramInput>) =>
  api.put(`/programs/${id}`, { body, schema: dataEnvelope(ProgramSchema) });

export const archiveProgram = (id: string) => api.post(`/programs/${id}/archive`);

export const assignProgram = (id: string, client_id: string) =>
  api.post(`/programs/${id}/assign`, { body: { client_id } });

export const replaceProgramExercises = (id: string, exercises: ProgramExerciseInput[]) =>
  api.put(`/programs/${id}/exercises`, { body: { exercises }, schema: dataEnvelope(ProgramSchema) });

export const toggleProgramLike = (id: string) => api.post(`/programs/${id}/like`);

export const removeClientProgram = (clientProgram: string) =>
  api.delete(`/client-programs/${clientProgram}`);
