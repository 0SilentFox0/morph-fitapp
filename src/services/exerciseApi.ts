import { apiFetch } from './apiClient';
import {
  ExercisesPageSchema,
  CategoriesPageSchema,
  SearchPageSchema,
  ApiExerciseInfoSchema,
  ApiExerciseTranslationSchema,
  ExerciseCategorySchema,
} from '../schemas/exerciseApi';
import { z } from 'zod';

export type ExerciseCategory = z.infer<typeof ExerciseCategorySchema>;
export type ApiExerciseTranslation = z.infer<typeof ApiExerciseTranslationSchema>;
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
  translations: ApiExerciseTranslation[],
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
  offset = 0,
): Promise<{ exercises: Exercise[]; total: number; hasMore: boolean }> {
  const raw = await apiFetch<unknown>(
    `/exerciseinfo/?format=json&limit=${limit}&offset=${offset}`,
  );
  const data = ExercisesPageSchema.parse(raw);
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
  const data = CategoriesPageSchema.parse(raw);
  return data.results ?? [];
}

export async function searchExercises(
  term: string,
): Promise<{ name: string; id: number }[]> {
  const raw = await apiFetch<unknown>(
    `/exercise/search/?format=json&language=english&term=${encodeURIComponent(term)}`,
  );
  const data = SearchPageSchema.parse(raw);
  return (data.suggestions ?? []).map((s) => ({
    id: s.data.id,
    name: s.data.name,
  }));
}
