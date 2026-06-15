import type { Program as ApiProgram } from '../../schemas/api/models';
import * as programsApi from '../../services/api/programs';
import {
  apiProgramToUi,
  loadPrograms,
} from '../../services/repositories/programsRepository';

afterEach(() => jest.restoreAllMocks());

const apiProgram: ApiProgram = {
  id: 'pr1',
  trainer_id: 'tr1',
  name: 'Leg Day',
  description: 'desc',
  difficulty: 'advanced',
  estimated_duration_min: 45,
  views_count: 12,
  likes_count: 3,
  archived_at: null,
  created_at: null,
  exercises: [{}, {}] as never,
};

describe('apiProgramToUi', () => {
  it('derives the tag from difficulty and the video count from exercises', () => {
    expect(apiProgramToUi(apiProgram)).toMatchObject({
      id: 'pr1',
      name: 'Leg Day',
      tag: 'Advanced',
      videoCount: 2,
      views: 12,
      likes: 3,
    });
  });

  it('falls back to a neutral tag when difficulty is absent', () => {
    expect(apiProgramToUi({ ...apiProgram, difficulty: null }).tag).toBe(
      'Program'
    );
  });
});

describe('loadPrograms', () => {
  it('returns mapped live programs and excludes archived ones', async () => {
    jest.spyOn(programsApi, 'listPrograms').mockResolvedValue({
      data: [
        apiProgram,
        { ...apiProgram, id: 'pr2', archived_at: '2026-01-01T00:00:00Z' },
      ],
    } as never);

    const result = await loadPrograms();

    expect(result.map((p) => p.id)).toEqual(['pr1']);
  });
});
