import { apiReadiness } from '../../config/apiReadiness';
import { mockTrainingPrograms } from '../../mocks';
import type { Program as ApiProgram } from '../../schemas/api/models';
import type { TrainingProgram } from '../../types';
import * as programsApi from '../api/programs';
import { withMockFallback } from '../mockFallback';

const TAG_BY_DIFFICULTY: Record<NonNullable<ApiProgram['difficulty']>, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/**
 * Adapt a backend program to the trainer-side library card shape.
 *
 * Backend gaps (see FRONTEND_INTEGRATION_CHANGES.md): the API program has no
 * `tag`/category, no cover `thumbnail` URL, and no `price`. Until those land we
 * derive `tag` from `difficulty`, leave the thumbnail to the card placeholder,
 * and omit price. Full exercise mapping (API count-based sets vs UI set arrays)
 * is deferred — the library list only needs the count.
 */
export function apiProgramToUi(p: ApiProgram): TrainingProgram {
  return {
    id: p.id,
    name: p.name,
    tag: p.difficulty ? TAG_BY_DIFFICULTY[p.difficulty] : 'Program',
    videoCount: p.exercises.length,
    views: p.views_count,
    likes: p.likes_count,
    description: p.description ?? undefined,
  };
}

/** Load the trainer's programs. Behind the `programs` readiness flag. */
export async function loadPrograms(): Promise<TrainingProgram[]> {
  return withMockFallback(
    apiReadiness.programs,
    async () => {
      const res = await programsApi.listPrograms({ per_page: 100 });

      return res.data.filter((p) => !p.archived_at).map(apiProgramToUi);
    },
    () => mockTrainingPrograms
  );
}
