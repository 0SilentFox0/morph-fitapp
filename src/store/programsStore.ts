import { create } from 'zustand';
import type { TrainingProgram } from '../mocks';

interface ProgramsState {
  programs: TrainingProgram[];
  addProgram: (program: Omit<TrainingProgram, 'id'>) => TrainingProgram;
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

const initialPrograms: TrainingProgram[] = [
  { id: '1', name: 'HIIT Power', tag: 'HIIT', videoCount: 10, views: 24, likes: 340, thumbnail: TRAINING_IMAGES[0], price: '$5/month' },
  { id: '2', name: 'Cardio Burn', tag: 'Cardio', videoCount: 8, views: 18, likes: 210, thumbnail: TRAINING_IMAGES[1], price: '$5/month' },
  { id: '3', name: 'Strength Builder', tag: 'Strength', videoCount: 12, views: 45, likes: 520, thumbnail: TRAINING_IMAGES[2], price: '$5/month' },
  { id: '4', name: 'Yoga Flow', tag: 'Yoga', videoCount: 15, views: 62, likes: 380, thumbnail: TRAINING_IMAGES[3], price: '$5/month' },
  { id: '5', name: 'Core Crush', tag: 'HIIT', videoCount: 6, views: 31, likes: 195, thumbnail: TRAINING_IMAGES[4], price: '$5/month' },
];

let nextId = 6;

export const useProgramsStore = create<ProgramsState>((set, get) => ({
  programs: initialPrograms,

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

  updateProgram: (id, updates) => {
    set((state) => ({
      programs: state.programs.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  },

  deleteProgram: (id) => {
    set((state) => ({
      programs: state.programs.filter((p) => p.id !== id),
    }));
  },

  getProgram: (id) => get().programs.find((p) => p.id === id),

  searchPrograms: (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return get().programs;
    return get().programs.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q)
    );
  },

  setPrograms: (programs) => set({ programs }),
}));
