import { create } from 'zustand';
import type { ProgramExercise, ExerciseSet } from '../mocks';

interface DraftProgramState {
  title: string;
  tag: string;
  description: string;
  exercises: ProgramExercise[];

  setTitle: (title: string) => void;
  setTag: (tag: string) => void;
  setDescription: (description: string) => void;
  setExercises: (exercises: ProgramExercise[]) => void;
  addExercises: (exercises: ProgramExercise[]) => void;
  removeExercise: (id: number) => void;
  updateExerciseSets: (id: number, sets: ExerciseSet[]) => void;
  addSet: (exerciseId: number) => void;
  removeSet: (exerciseId: number, setIndex: number) => void;
  updateSet: (exerciseId: number, setIndex: number, update: Partial<ExerciseSet>) => void;
  reset: () => void;
}

const INITIAL: Pick<DraftProgramState, 'title' | 'tag' | 'description' | 'exercises'> = {
  title: '',
  tag: 'Cardio',
  description: '',
  exercises: [],
};

export const useDraftProgramStore = create<DraftProgramState>((set) => ({
  ...INITIAL,

  setTitle: (title) => set({ title }),
  setTag: (tag) => set({ tag }),
  setDescription: (description) => set({ description }),
  setExercises: (exercises) => set({ exercises }),

  addExercises: (newExercises) =>
    set((s) => {
      const existingIds = new Set(s.exercises.map((e) => e.id));
      const unique = newExercises.filter((e) => !existingIds.has(e.id));
      return { exercises: [...s.exercises, ...unique] };
    }),

  removeExercise: (id) =>
    set((s) => ({ exercises: s.exercises.filter((e) => e.id !== id) })),

  updateExerciseSets: (id, sets) =>
    set((s) => ({
      exercises: s.exercises.map((e) => (e.id === id ? { ...e, sets } : e)),
    })),

  addSet: (exerciseId) =>
    set((s) => ({
      exercises: s.exercises.map((e) => {
        if (e.id !== exerciseId) return e;
        const lastSet = e.sets[e.sets.length - 1];
        return {
          ...e,
          sets: [...e.sets, { weight: lastSet?.weight ?? 20, reps: lastSet?.reps ?? 10 }],
        };
      }),
    })),

  removeSet: (exerciseId, setIndex) =>
    set((s) => ({
      exercises: s.exercises.map((e) => {
        if (e.id !== exerciseId) return e;
        if (e.sets.length <= 1) return e;
        return { ...e, sets: e.sets.filter((_, i) => i !== setIndex) };
      }),
    })),

  updateSet: (exerciseId, setIndex, update) =>
    set((s) => ({
      exercises: s.exercises.map((e) => {
        if (e.id !== exerciseId) return e;
        return {
          ...e,
          sets: e.sets.map((st, i) => (i === setIndex ? { ...st, ...update } : st)),
        };
      }),
    })),

  reset: () => set(INITIAL),
}));
