import { buildExerciseCatalog } from '../../utils/exerciseCatalog';
import type { TrainingProgram } from '../../types';

const programs: TrainingProgram[] = [
  {
    id: 'p1', name: 'A', tag: 'X', videoCount: 0, views: 0, likes: 0,
    exercises: [
      { id: 1, name: 'Squat', category: 'Legs', imageUrl: null, sets: [{ weight: 40, reps: 10 }] },
      { id: 2, name: 'Bench', category: 'Chest', imageUrl: null, sets: [{ weight: 50, reps: 8 }] },
    ],
  },
  {
    id: 'p2', name: 'B', tag: 'Y', videoCount: 0, views: 0, likes: 0,
    exercises: [
      { id: 1, name: 'Squat', category: 'Legs', imageUrl: null, sets: [{ weight: 60, reps: 6 }] },
    ],
  },
  { id: 'p3', name: 'C', tag: 'Z', videoCount: 0, views: 0, likes: 0 },
];

describe('buildExerciseCatalog', () => {
  it('dedupes exercises by id, keeping the first occurrence', () => {
    const catalog = buildExerciseCatalog(programs);
    expect(catalog.map((e) => e.id)).toEqual([1, 2]);
    expect(catalog.find((e) => e.id === 1)!.sets[0]!.weight).toBe(40);
  });

  it('ignores programs without exercises', () => {
    const catalog = buildExerciseCatalog([programs[2]!]);
    expect(catalog).toEqual([]);
  });
});
