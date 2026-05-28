import { apiFetch } from './apiClient';

export interface ExerciseCategory {
  id: number;
  name: string;
}

export interface ExerciseImage {
  id: number;
  image: string;
  is_main: boolean;
}

export interface ApiExerciseTranslation {
  name: string;
  description: string;
  language: number;
}

export interface ApiExerciseInfo {
  id: number;
  category: ExerciseCategory;
  images: ExerciseImage[];
  translations: ApiExerciseTranslation[];
  muscles: { id: number; name_en: string }[];
}

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

interface ExercisesPage {
  results: ApiExerciseInfo[];
  count?: number;
  next?: string | null;
}

interface CategoriesPage {
  results: ExerciseCategory[];
}

interface SearchSuggestion {
  data: { id: number; name: string };
}

interface SearchPage {
  suggestions?: SearchSuggestion[];
}

export async function fetchExercises(
  limit = 20,
  offset = 0,
): Promise<{ exercises: Exercise[]; total: number; hasMore: boolean }> {
  const data = await apiFetch<ExercisesPage>(
    `/exerciseinfo/?format=json&limit=${limit}&offset=${offset}`,
  );
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
  const data = await apiFetch<CategoriesPage>(`/exercisecategory/?format=json`);
  return data.results ?? [];
}

export async function searchExercises(
  term: string,
): Promise<{ name: string; id: number }[]> {
  const data = await apiFetch<SearchPage>(
    `/exercise/search/?format=json&language=english&term=${encodeURIComponent(term)}`,
  );
  return (data.suggestions ?? []).map((s) => ({
    id: s.data.id,
    name: s.data.name,
  }));
}
