import { computeProgressOverview, rankMuscles } from '../../utils/progress';
import { computeMuscleStats } from '../../utils/muscleStats';
import type { MuscleGroup } from '../../constants/muscles';
import type { CompletedTraining } from '../../types';

const lookup: Record<number, MuscleGroup[]> = {
  101: ['chest', 'triceps'],
  301: ['quads', 'glutes'],
};

const history: CompletedTraining[] = [
  {
    id: 't1',
    clientName: 'Me',
    programId: '1',
    date: 'Dec 1',
    exercises: [{ exerciseId: 101, sets: [{ weight: 50, reps: 10 }] }], // chest/triceps 500
  },
  {
    id: 't2',
    clientName: 'Me',
    programId: '3',
    date: 'Dec 8',
    exercises: [{ exerciseId: 301, sets: [{ weight: 100, reps: 10 }] }], // quads/glutes 1000
  },
];

describe('rankMuscles', () => {
  it('ranks worked muscles by tonnage and excludes untouched ones', () => {
    const stats = computeMuscleStats(history, lookup);
    const ranked = rankMuscles(stats);
    expect(ranked[0]?.group).toBe('quads'); // 1000 > 500
    expect(ranked.map((r) => r.group)).toEqual(
      expect.arrayContaining(['quads', 'glutes', 'chest', 'triceps']),
    );
    expect(ranked.every((r) => r.stat.exerciseCount > 0)).toBe(true);
  });
});

describe('computeProgressOverview', () => {
  it('returns intensities, totals and ranked top muscles for all-time', () => {
    const now = new Date(2026, 0, 10);
    const overview = computeProgressOverview(history, lookup, 'all', now);
    expect(overview.topMuscles[0]?.group).toBe('quads');
    expect(overview.totals.tonnage).toBeGreaterThan(0);
    expect(Object.keys(overview.intensities).length).toBeGreaterThan(0);
  });
});
