const BASE_URL = 'https://wger.de/api/v2';

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

export async function fetchExercises(
  limit = 20,
  offset = 0,
): Promise<{ exercises: Exercise[]; total: number; hasMore: boolean }> {
  const res = await fetch(
    `${BASE_URL}/exerciseinfo/?format=json&limit=${limit}&offset=${offset}`,
    { headers: { Accept: 'application/json' } },
  );
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const data = await res.json();
  const exercises = (data.results as ApiExerciseInfo[])
    .map(mapExercise)
    .filter((e): e is Exercise => e !== null);

  return {
    exercises,
    total: data.count ?? 0,
    hasMore: !!data.next,
  };
}

export async function fetchCategories(): Promise<ExerciseCategory[]> {
  const res = await fetch(`${BASE_URL}/exercisecategory/?format=json`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const data = await res.json();
  return data.results as ExerciseCategory[];
}

export async function searchExercises(
  term: string,
): Promise<{ name: string; id: number }[]> {
  const res = await fetch(
    `${BASE_URL}/exercise/search/?format=json&language=english&term=${encodeURIComponent(term)}`,
    { headers: { Accept: 'application/json' } },
  );
  if (!res.ok) return [];

  const data = await res.json();
  return (data.suggestions ?? []).map(
    (s: { data: { id: number; name: string } }) => ({
      id: s.data.id,
      name: s.data.name,
    }),
  );
}
