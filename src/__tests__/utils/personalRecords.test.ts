import { computePRs } from '../../utils/progress/personalRecords';
import type { CompletedTraining } from '../../types';

const history: CompletedTraining[] = [
  {
    id: '1',
    clientName: 'Me',
    programId: '3',
    date: 'Jun 1',
    exercises: [
      { exerciseId: 301, sets: [{ weight: 60, reps: 10 }, { weight: 80, reps: 5 }] },
      { exerciseId: 103, sets: [{ weight: 0, reps: 30 }, { weight: 0, reps: 40 }] }, // bodyweight
    ],
  },
  {
    id: '2',
    clientName: 'Me',
    programId: '3',
    date: 'Jun 8',
    exercises: [
      { exerciseId: 301, sets: [{ weight: 90, reps: 3 }] }, // new heaviest
    ],
  },
];

describe('computePRs', () => {
  it('tracks the heaviest set and reps at that weight across the history', () => {
    const prs = computePRs(history);
    const squat = prs.find((p) => p.exerciseId === 301)!;
    expect(squat.maxWeight).toBe(90);
    expect(squat.repsAtMaxWeight).toBe(3);
    expect(squat.maxReps).toBe(10);
  });

  it('estimates 1RM with Epley and rounds to whole kg', () => {
    const prs = computePRs(history);
    const squat = prs.find((p) => p.exerciseId === 301)!;
    // best of: 60*(1+10/30)=80, 80*(1+5/30)=93.3, 90*(1+3/30)=99 → 99
    expect(squat.best1RM).toBe(99);
  });

  it('handles bodyweight exercises (0 weight) by tracking reps, with 1RM = 0', () => {
    const prs = computePRs(history);
    const bw = prs.find((p) => p.exerciseId === 103)!;
    expect(bw.maxWeight).toBe(0);
    expect(bw.maxReps).toBe(40);
    expect(bw.best1RM).toBe(0);
  });

  it('sorts by best 1RM descending', () => {
    const prs = computePRs(history);
    expect(prs[0]?.exerciseId).toBe(301); // weighted beats bodyweight
  });
});
