import type { CompletedTraining } from '../../types';
import {
  applyProgression,
  trainingMetric,
} from '../../utils/training/progression';

describe('applyProgression', () => {
  it('returns the same values at 0%', () => {
    const sets = [
      { weight: 40, reps: 30 },
      { weight: 55, reps: 12, note: 'failure' as const },
    ];

    expect(applyProgression(sets, 0, 0)).toEqual(sets);
  });

  it('applies weight and reps percentages independently', () => {
    // 40 * 1.10 = 44 ; 30 * 1.05 = 31.5 -> 32
    expect(applyProgression([{ weight: 40, reps: 30 }], 10, 5)).toEqual([
      { weight: 44, reps: 32 },
    ]);
  });

  it('rounds weight to the nearest 0.5 and reps to a whole number', () => {
    // 41 * 1.05 = 43.05 -> 43 ; 9 * 1.10 = 9.9 -> 10
    expect(applyProgression([{ weight: 41, reps: 9 }], 5, 10)).toEqual([
      { weight: 43, reps: 10 },
    ]);
  });

  it('keeps zero weight (bodyweight/cardio) at zero', () => {
    expect(applyProgression([{ weight: 0, reps: 20 }], 15, 15)).toEqual([
      { weight: 0, reps: 23 },
    ]);
  });

  it('preserves the set note', () => {
    const [out] = applyProgression(
      [{ weight: 50, reps: 10, note: 'dropset' }],
      10,
      0
    );

    expect(out!.note).toBe('dropset');
  });
});

describe('trainingMetric', () => {
  const training = (
    exercises: CompletedTraining['exercises']
  ): CompletedTraining => ({
    id: 'x',
    clientName: 'X',
    programId: '1',
    date: 'Dec 1',
    exercises,
  });

  it('sums weight×reps across all sets', () => {
    // 50*10 + 60*8 = 980
    expect(
      trainingMetric(
        training([
          {
            exerciseId: 1,
            sets: [
              { weight: 50, reps: 10 },
              { weight: 60, reps: 8 },
            ],
          },
        ])
      )
    ).toBe(980);
  });

  it('counts reps alone for bodyweight/cardio sets (weight 0)', () => {
    // 50*10 + 20 = 520
    expect(
      trainingMetric(
        training([
          {
            exerciseId: 1,
            sets: [
              { weight: 50, reps: 10 },
              { weight: 0, reps: 20 },
            ],
          },
        ])
      )
    ).toBe(520);
  });
});
