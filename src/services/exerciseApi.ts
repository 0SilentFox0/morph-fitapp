import { z } from 'zod';

import {
  ApiExerciseInfoSchema,
  ApiExerciseTranslationSchema,
  CategoriesPageSchema,
  ExerciseCategorySchema,
  ExercisesPageSchema,
  SearchPageSchema,
} from '../schemas/exerciseApi';
import { apiFetch } from './apiClient';

/**
 * Validates a raw API payload against a schema, throwing a concise,
 * user-presentable error instead of Zod's verbose issue dump when the
 * server returns an unexpected shape. Callers already catch and surface
 * the message (see exerciseStore).
 */
function parseResponse<T>(
  schema: z.ZodType<T>,
  raw: unknown,
  label: string
): T {
  const result = schema.safeParse(raw);

  if (!result.success) {
    throw new Error(
      `Received an unexpected ${label} response from the server.`
    );
  }

  return result.data;
}

export type ExerciseCategory = z.infer<typeof ExerciseCategorySchema>;
export type ApiExerciseTranslation = z.infer<
  typeof ApiExerciseTranslationSchema
>;
export type ApiExerciseInfo = z.infer<typeof ApiExerciseInfoSchema>;

export interface Exercise {
  id: number;
  name: string;
  description: string;
  category: string;
  categoryId: number;
  imageUrl: string | null;
  muscles: string[];
}

function getEnglishTranslation(
  translations: ApiExerciseTranslation[]
): { name: string; description: string } | null {
  const en = translations.find((t) => t.language === 2);

  if (en && en.name) return { name: en.name, description: en.description };

  return null;
}

function mapExercise(raw: ApiExerciseInfo): Exercise | null {
  const translation = getEnglishTranslation(raw.translations);

  if (!translation || !translation.name) return null;

  const mainImage = raw.images.find((img) => img.is_main) ?? raw.images[0];

  return {
    id: raw.id,
    name: translation.name,
    description: translation.description?.replace(/<[^>]*>/g, '') ?? '',
    category: raw.category?.name ?? 'Other',
    categoryId: raw.category?.id ?? 0,
    imageUrl: mainImage?.image ?? null,
    muscles: raw.muscles?.map((m) => m.name_en).filter(Boolean) ?? [],
  };
}

export async function fetchExercises(
  limit = 20,
  offset = 0
): Promise<{ exercises: Exercise[]; total: number; hasMore: boolean }> {
  const raw = await apiFetch<unknown>(
    `/exerciseinfo/?format=json&limit=${limit}&offset=${offset}`
  );

  const data = parseResponse(ExercisesPageSchema, raw, 'exercises');

  const exercises = data.results
    .map(mapExercise)
    .filter((e): e is Exercise => e !== null);

  return {
    exercises,
    total: data.count ?? 0,
    hasMore: !!data.next,
  };
}

export async function fetchCategories(): Promise<ExerciseCategory[]> {
  const raw = await apiFetch<unknown>(`/exercisecategory/?format=json`);

  const data = parseResponse(CategoriesPageSchema, raw, 'categories');

  return data.results ?? [];
}

export async function searchExercises(
  term: string
): Promise<{ name: string; id: number }[]> {
  const raw = await apiFetch<unknown>(
    `/exercise/search/?format=json&language=english&term=${encodeURIComponent(term)}`
  );

  const data = parseResponse(SearchPageSchema, raw, 'search');

  return (data.suggestions ?? []).map((s) => ({
    id: s.data.id,
    name: s.data.name,
  }));
}
