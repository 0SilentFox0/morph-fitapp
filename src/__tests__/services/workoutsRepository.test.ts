import * as workoutsApi from '../../services/api/workouts';
import {
  finishWorkout,
  startWorkout,
  toLogSetInput,
} from '../../services/repositories/workoutsRepository';

afterEach(() => jest.restoreAllMocks());

describe('toLogSetInput', () => {
  const base = {
    workoutLogExerciseId: 'wle1',
    exerciseId: 'ex1',
    setIndex: 0,
    clientUuid: 'cl1',
    set: { weight: 40, reps: 10 },
  };

  it('maps editable set values to the API LogSetInput shape', () => {
    expect(toLogSetInput(base)).toMatchObject({
      workout_log_exercise_id: 'wle1',
      exercise_id: 'ex1',
      set_index: 0,
      reps: 10,
      weight_kg: 40,
      client_uuid: 'cl1',
    });
  });

  it('clamps negative reps/weight to zero (no garbage reaches the API)', () => {
    const input = toLogSetInput({ ...base, set: { weight: -5, reps: -2 } });

    expect(input.weight_kg).toBe(0);
    expect(input.reps).toBe(0);
  });
});

describe('startWorkout / finishWorkout', () => {
  it('startWorkout calls the live API when workouts are ready', async () => {
    const spy = jest
      .spyOn(workoutsApi, 'startWorkout')
      .mockResolvedValue({ data: { id: 'log1', session_id: 's1' } } as never);

    const log = await startWorkout('11111111-1111-4111-8111-111111111111');

    expect(spy).toHaveBeenCalled();
    expect(log.id).toBe('log1');
  });

  it('finishWorkout posts to the finish endpoint', async () => {
    const spy = jest
      .spyOn(workoutsApi, 'finishWorkout')
      .mockResolvedValue({ data: { id: 'log1', session_id: 's1' } } as never);

    await finishWorkout('log1');

    expect(spy).toHaveBeenCalledWith('log1');
  });
});
