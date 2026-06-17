import type { WorkoutLog } from '../../schemas/api/models';
import * as meApi from '../../services/api/me';
import {
  apiWorkoutLogToCompletedTraining,
  getCurrentUserName,
  loadClientWorkoutLogs,
} from '../../services/repositories/trainingHistoryRepository';

afterEach(() => jest.restoreAllMocks());

const log = (over: Partial<WorkoutLog> = {}): WorkoutLog =>
  ({
    id: 'log1',
    session_id: 'sess1',
    started_at: '2026-06-01T08:00:00Z',
    finished_at: '2026-06-01T09:00:00Z',
    created_at: '2026-06-01T07:00:00Z',
    exercises: [
      {
        id: 'wle1',
        exercise_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        order: 0,
        name_snapshot: 'Squat',
        sets: [
          { weight_kg: 100, reps: 5 },
          { weight_kg: 100, reps: 4 },
        ],
      },
    ],
    ...over,
  }) as unknown as WorkoutLog;

describe('apiWorkoutLogToCompletedTraining', () => {
  it('maps sets (weight_kg → weight) and tags the current-user join key', () => {
    const ct = apiWorkoutLogToCompletedTraining(log());

    expect(ct).toMatchObject({
      id: 'log1',
      clientName: getCurrentUserName(),
      programId: 'sess1', // logs link to a session, not a program
      date: '2026-06-01T09:00:00Z', // finished_at preferred
    });
    expect(ct.exercises[0]!.sets).toEqual([
      { weight: 100, reps: 5 },
      { weight: 100, reps: 4 },
    ]);
    expect(typeof ct.exercises[0]!.exerciseId).toBe('number');
  });

  it('falls back to started_at, then created_at, for the date', () => {
    expect(
      apiWorkoutLogToCompletedTraining(log({ finished_at: null })).date
    ).toBe('2026-06-01T08:00:00Z');
    expect(
      apiWorkoutLogToCompletedTraining(
        log({ finished_at: null, started_at: null })
      ).date
    ).toBe('2026-06-01T07:00:00Z');
  });

  it('produces distinct, stable numeric ids for distinct exercise UUIDs', () => {
    const a = apiWorkoutLogToCompletedTraining(log()).exercises[0]!.exerciseId;

    const a2 = apiWorkoutLogToCompletedTraining(log()).exercises[0]!.exerciseId;

    const b = apiWorkoutLogToCompletedTraining(
      log({
        exercises: [
          {
            id: 'wle2',
            exercise_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            order: 0,
            name_snapshot: 'Bench',
            sets: [],
          },
        ],
      } as unknown as Partial<WorkoutLog>)
    ).exercises[0]!.exerciseId;

    expect(a).toBe(a2); // stable
    expect(a).not.toBe(b); // distinct
  });
});

describe('loadClientWorkoutLogs', () => {
  it('fetches GET /me/workout-logs and returns trainings oldest → newest', async () => {
    const spy = jest.spyOn(meApi, 'getMyWorkoutLogs').mockResolvedValue({
      data: [
        log({ id: 'newer', finished_at: '2026-06-10T09:00:00Z' }),
        log({ id: 'older', finished_at: '2026-06-01T09:00:00Z' }),
      ],
    } as never);

    const history = await loadClientWorkoutLogs();

    expect(spy).toHaveBeenCalledWith({ per_page: 200 });
    expect(history.map((h) => h.id)).toEqual(['older', 'newer']);
  });
});
