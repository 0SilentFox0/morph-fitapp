import { create } from 'zustand';

import { loadPrograms as loadProgramsFromApi } from '../services/repositories/programsRepository';
import type { ProgramExercise, TrainingProgram } from '../types';
import { searchItems } from '../utils/common/search';
import { removeById, updateById } from './collection';

export interface DraftProgramData {
  title: string;
  tag: string;
  description: string;
  exercises: ProgramExercise[];
}

interface ProgramsState {
  programs: TrainingProgram[];
  /** True once the API list has been pulled at least once this session. */
  loaded: boolean;
  /**
   * Load the trainer's programs from the API into the store. No-ops after the
   * first successful load (so locally created/edited programs aren't wiped on
   * re-entry) unless `force` is passed.
   */
  loadPrograms: (force?: boolean) => Promise<TrainingProgram[]>;
  addProgram: (program: Omit<TrainingProgram, 'id'>) => TrainingProgram;
  addProgramFromDraft: (draft: DraftProgramData) => TrainingProgram;
  updateProgram: (id: string, updates: Partial<TrainingProgram>) => void;
  deleteProgram: (id: string) => void;
  getProgram: (id: string) => TrainingProgram | undefined;
  searchPrograms: (query: string) => TrainingProgram[];
  setPrograms: (programs: TrainingProgram[]) => void;
}

const TRAINING_IMAGES = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c149e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=400&fit=crop',
];

let nextId = 1;

export const useProgramsStore = create<ProgramsState>((set, get) => ({
  // Starts empty: a new trainer has no seeded programs. loadPrograms() pulls
  // their real library from the API (or the mock fallback while not deployed).
  programs: [],
  loaded: false,

  loadPrograms: async (force = false) => {
    if (get().loaded && !force) return get().programs;

    const programs = await loadProgramsFromApi();

    set({ programs, loaded: true });

    return programs;
  },

  addProgram: (program) => {
    const id = String(nextId++);

    const thumbIndex = (nextId - 1) % TRAINING_IMAGES.length;

    const newProgram: TrainingProgram = {
      ...program,
      id,
      thumbnail: program.thumbnail ?? TRAINING_IMAGES[thumbIndex],
    };

    set((state) => ({ programs: [newProgram, ...state.programs] }));

    return newProgram;
  },

  addProgramFromDraft: (draft) => {
    return get().addProgram({
      name: draft.title || 'New Program',
      tag: draft.tag || 'HIIT',
      description: draft.description,
      exercises: draft.exercises,
      videoCount: draft.exercises.length,
      views: 0,
      likes: 0,
      price: '$5/month',
    });
  },

  updateProgram: (id, updates) => {
    set((state) => ({ programs: updateById(state.programs, id, updates) }));
  },

  deleteProgram: (id) => {
    set((state) => ({ programs: removeById(state.programs, id) }));
  },

  getProgram: (id) => get().programs.find((p) => p.id === id),

  searchPrograms: (query) =>
    searchItems(query, get().programs, (p) => [p.name, p.tag]),

  setPrograms: (programs) => set({ programs }),
}));
