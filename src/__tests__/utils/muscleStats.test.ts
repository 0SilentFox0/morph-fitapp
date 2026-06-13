import {
  computeMuscleStats,
  toIntensities,
  emptyMuscleStats,
} from '../../utils/muscleStats';
import type { MuscleGroup } from '../../constants/muscles';
import type { CompletedTraining } from '../../mocks';

const lookup: Record<number, MuscleGroup[]> = {
  101: ['chest', 'triceps'],
  301: ['quads', 'glutes'],
  // 999 intentionally absent
};

const history: CompletedTraining[] = [
  {
    id: 't1',
    clientName: 'Me',
    programId: '1',
    date: 'Dec 1',
    exercises: [
      { exerciseId: 101, sets: [{ weight: 50, reps: 10 }, { weight: 60, reps: 8 }] }, // 500 + 480 = 980
      { exerciseId: 999, sets: [{ weight: 100, reps: 5 }] }, // unknown -> skipped
    ],
  },
  {
    id: 't2',
    clientName: 'Me',
    programId: '3',
    date: 'Dec 8',
    exercises: [
      { exerciseId: 301, sets: [{ weight: 0, reps: 20 }] }, // bodyweight -> 0 tonnage, still counts
      { exerciseId: 101, sets: [{ weight: 40, reps: 10 }] }, // 400
    ],
  },
];

describe('computeMuscleStats', () => {
  it('aggregates tonnage (weight*reps) per muscle from history via the lookup', () => {
    const stats = computeMuscleStats(history, lookup);
    // chest hit by 101 twice: (980) + (400) = 1380
    expect(stats.chest.totalWeight).toBe(1380);
    expect(stats.triceps.totalWeight).toBe(1380);
    // quads/glutes hit by 301 with 0 weight
    expect(stats.quads.totalWeight).toBe(0);
    expect(stats.glutes.totalWeight).toBe(0);
  });

  it('counts each logged exercise once per targeted muscle (exerciseCount) and all sets (setCount)', () => {
    const stats = computeMuscleStats(history, lookup);
    expect(stats.chest.exerciseCount).toBe(2); // 101 appears in two trainings
    expect(stats.chest.setCount).toBe(3); // 2 + 1 sets
    expect(stats.quads.exerciseCount).toBe(1);
    expect(stats.quads.setCount).toBe(1);
  });

  it('skips exercises with no muscle mapping', () => {
    const stats = computeMuscleStats(history, lookup);
    // 999 contributed to nothing; back was never targeted
    expect(stats.back.totalWeight).toBe(0);
    expect(stats.back.exerciseCount).toBe(0);
  });

  it('returns a zeroed entry for every muscle group', () => {
    const stats = computeMuscleStats([], lookup);
    expect(stats).toEqual(emptyMuscleStats());
    expect(stats.calves).toEqual({ totalWeight: 0, exerciseCount: 0, setCount: 0 });
  });
});

describe('toIntensities', () => {
  it('normalizes the chosen metric to 0..1 against the max', () => {
    const stats = computeMuscleStats(history, lookup);
    const intensities = toIntensities(stats, 'totalWeight');
    expect(intensities.chest).toBe(1); // chest is the max (1380)
    expect(intensities.quads).toBe(0);
  });

  it('falls back to setCount when every tonnage is zero (pure bodyweight/cardio)', () => {
    const bodyweight: CompletedTraining[] = [
      {
        id: 'b',
        clientName: 'Me',
        programId: '2',
        date: 'Dec 1',
        exercises: [{ exerciseId: 301, sets: [{ weight: 0, reps: 20 }, { weight: 0, reps: 20 }] }],
      },
    ];
    const stats = computeMuscleStats(bodyweight, lookup);
    const intensities = toIntensities(stats, 'totalWeight');
    expect(intensities.quads).toBe(1);
    expect(intensities.glutes).toBe(1);
    expect(intensities.chest).toBe(0);
  });

  it('returns all zeros when there is no data at all', () => {
    const intensities = toIntensities(emptyMuscleStats(), 'totalWeight');
    expect(Object.values(intensities).every((v) => v === 0)).toBe(true);
  });
});
