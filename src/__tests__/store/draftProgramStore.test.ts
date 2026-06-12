// The draft store persists via AsyncStorage; the official in-memory mock is
// registered globally in jest.setup.js.
import { useDraftProgramStore } from '../../store/draftProgramStore';
import type { ProgramExercise } from '../../mocks';

function exercise(id: number, sets = [{ weight: 20, reps: 10 }]): ProgramExercise {
  return { id, name: `Ex ${id}`, category: 'Strength', imageUrl: null, sets };
}

beforeEach(() => {
  useDraftProgramStore.getState().reset();
});

describe('useDraftProgramStore', () => {
  it('setters update individual fields', () => {
    useDraftProgramStore.getState().setTitle('Leg Day');
    useDraftProgramStore.getState().setTag('Strength');
    expect(useDraftProgramStore.getState().title).toBe('Leg Day');
    expect(useDraftProgramStore.getState().tag).toBe('Strength');
  });

  it('addExercises de-duplicates by id', () => {
    useDraftProgramStore.getState().addExercises([exercise(1), exercise(2)]);
    useDraftProgramStore.getState().addExercises([exercise(2), exercise(3)]);

    expect(useDraftProgramStore.getState().exercises.map((e) => e.id)).toEqual([1, 2, 3]);
  });

  it('removeExercise drops the matching exercise', () => {
    useDraftProgramStore.getState().addExercises([exercise(1), exercise(2)]);
    useDraftProgramStore.getState().removeExercise(1);
    expect(useDraftProgramStore.getState().exercises.map((e) => e.id)).toEqual([2]);
  });

  it('addSet clones the last set, falling back to 20kg x 10 when there are none', () => {
    useDraftProgramStore.getState().addExercises([exercise(1, [{ weight: 50, reps: 5 }])]);
    useDraftProgramStore.getState().addSet(1);
    const sets = useDraftProgramStore.getState().exercises[0]!.sets;
    expect(sets).toHaveLength(2);
    expect(sets[1]).toEqual({ weight: 50, reps: 5 });
  });

  it('removeSet keeps at least one set', () => {
    useDraftProgramStore.getState().addExercises([exercise(1, [{ weight: 20, reps: 10 }])]);
    useDraftProgramStore.getState().removeSet(1, 0);
    expect(useDraftProgramStore.getState().exercises[0]!.sets).toHaveLength(1);
  });

  it('updateSet merges a partial update into the targeted set', () => {
    useDraftProgramStore.getState().addExercises([exercise(1, [{ weight: 20, reps: 10 }])]);
    useDraftProgramStore.getState().updateSet(1, 0, { weight: 99 });
    expect(useDraftProgramStore.getState().exercises[0]!.sets[0]).toEqual({ weight: 99, reps: 10 });
  });

  it('reset restores the initial draft', () => {
    useDraftProgramStore.getState().setTitle('Something');
    useDraftProgramStore.getState().addExercises([exercise(1)]);
    useDraftProgramStore.getState().reset();

    expect(useDraftProgramStore.getState().title).toBe('');
    expect(useDraftProgramStore.getState().tag).toBe('Cardio');
    expect(useDraftProgramStore.getState().exercises).toEqual([]);
  });
});
