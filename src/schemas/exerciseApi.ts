import { z } from 'zod';

export const ApiExerciseTranslationSchema = z.object({
  name: z.string(),
  description: z.string(),
  language: z.number(),
});

export const ExerciseCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const ExerciseImageSchema = z.object({
  id: z.number(),
  image: z.string(),
  is_main: z.boolean(),
});

export const MuscleSchema = z.object({
  id: z.number(),
  name_en: z.string(),
});

export const ApiExerciseInfoSchema = z.object({
  id: z.number(),
  category: ExerciseCategorySchema.nullable().optional(),
  images: z.array(ExerciseImageSchema).default([]),
  translations: z.array(ApiExerciseTranslationSchema).default([]),
  muscles: z.array(MuscleSchema).default([]),
});

export const ExercisesPageSchema = z.object({
  results: z.array(ApiExerciseInfoSchema),
  count: z.number().optional(),
  next: z.string().nullable().optional(),
});

export const CategoriesPageSchema = z.object({
  results: z.array(ExerciseCategorySchema),
});

export const SearchSuggestionSchema = z.object({
  data: z.object({ id: z.number(), name: z.string() }),
});

export const SearchPageSchema = z.object({
  suggestions: z.array(SearchSuggestionSchema).optional(),
});
