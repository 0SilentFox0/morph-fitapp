import { act, renderHook } from '@testing-library/react-native';

import { useExerciseProgression } from '../../screens/home/screens/SessionForm/useExerciseProgression';
import { useTrainingHistoryStore } from '../../store/trainingHistoryStore';

const program = {
  id: 'p1',
  exercises: [{ id: 1, name: 'Squat', sets: [{ weight: 100, reps: 5 }] }],
} as never;

beforeEach(() => {
  // No prior training → bases fall back to the program template.
  useTrainingHistoryStore.setState({ getLastSets: () => null });
});

describe('useExerciseProgression', () => {
  it('emits the template sets unchanged at 0% progression', async () => {
    const onChange = jest.fn();

    await renderHook(() => useExerciseProgression(program, 'Sarah', onChange));

    expect(onChange).toHaveBeenCalled();

    const planned = onChange.mock.calls.at(-1)![0];

    expect(planned[1][0].weight).toBe(100);
  });

  it('re-emits heavier target sets when weight progression is bumped', async () => {
    const onChange = jest.fn();

    const { result } = await renderHook(() =>
      useExerciseProgression(program, 'Sarah', onChange)
    );

    await act(async () => result.current.setExercisePct(1, 'weightPct', 10));

    const planned = onChange.mock.calls.at(-1)![0];

    expect(planned[1][0].weight).toBeGreaterThan(100);
  });
});
