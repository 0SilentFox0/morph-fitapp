import {
  listExerciseProgress,
  exerciseSessionSeries,
  overallVolumeSeries,
} from '../../utils/exerciseProgress';
import type { CompletedTraining, ExerciseInfo } from '../../types';

const catalog: Record<number, ExerciseInfo> = {
  101: { id: 101, name: 'Bench press', category: 'Chest', muscles: ['chest'] },
  301: { id: 301, name: 'Back squat', category: 'Legs', muscles: ['quads'] },
};

const history: CompletedTraining[] = [
  {
    id: '1', clientName: 'Me', programId: '1', date: 'Jun 1',
    exercises: [
      { exerciseId: 101, sets: [{ weight: 50, reps: 10 }, { weight: 60, reps: 8 }] }, // vol 980, top 60
      { exerciseId: 301, sets: [{ weight: 80, reps: 5 }] }, // vol 400
    ],
  },
  {
    id: '2', clientName: 'Me', programId: '1', date: 'Jun 8',
    exercises: [
      { exerciseId: 101, sets: [{ weight: 70, reps: 6 }] }, // vol 420, top 70
    ],
  },
];

describe('listExerciseProgress', () => {
  it('summarizes each exercise with sessions, top weight and best 1RM', () => {
    const list = listExerciseProgress(history, catalog);
    const bench = list.find((e) => e.exerciseId === 101)!;
    expect(bench.name).toBe('Bench press');
    expect(bench.sessions).toBe(2);
    expect(bench.topWeight).toBe(70);
    expect(bench.best1RM).toBe(Math.round(70 * (1 + 6 / 30))); // 84
  });

  it('orders by most recently performed', () => {
    const list = listExerciseProgress(history, catalog);
    expect(list[0]?.exerciseId).toBe(101); // performed last on Jun 8
  });
});

describe('exerciseSessionSeries', () => {
  it('weight metric → top-set weight per session it appears in', () => {
    expect(exerciseSessionSeries(history, 101, 'weight')).toEqual([
      { date: 'Jun 1', value: 60 },
      { date: 'Jun 8', value: 70 },
    ]);
  });

  it('volume metric → tonnage per session', () => {
    expect(exerciseSessionSeries(history, 101, 'volume')).toEqual([
      { date: 'Jun 1', value: 980 },
      { date: 'Jun 8', value: 420 },
    ]);
  });

  it('omits sessions without the exercise', () => {
    expect(exerciseSessionSeries(history, 301, 'volume')).toEqual([{ date: 'Jun 1', value: 400 }]);
  });
});

describe('overallVolumeSeries', () => {
  it('totals all exercise volume per session, chronological', () => {
    expect(overallVolumeSeries(history)).toEqual([
      { date: 'Jun 1', value: 1380 }, // 980 + 400
      { date: 'Jun 8', value: 420 },
    ]);
  });
});
