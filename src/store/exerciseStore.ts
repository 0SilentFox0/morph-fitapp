import { create } from 'zustand';
import {
  fetchExercises,
  fetchCategories,
  type Exercise,
  type ExerciseCategory,
} from '../services/exerciseApi';
import { toErrorMessage } from '../utils';
import { searchItems } from '../utils/search';

interface ExerciseState {
  exercises: Exercise[];
  categories: ExerciseCategory[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  offset: number;
  hasMore: boolean;
  searchQuery: string;
  selectedCategory: number | null;

  loadExercises: () => Promise<void>;
  loadMore: () => Promise<void>;
  loadCategories: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (id: number | null) => void;
  filteredExercises: () => Exercise[];
}

const PAGE_SIZE = 20;

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  categories: [],
  loading: false,
  loadingMore: false,
  error: null,
  offset: 0,
  hasMore: true,
  searchQuery: '',
  selectedCategory: null,

  loadExercises: async () => {
    if (get().loading) return;
    set({ loading: true, error: null, offset: 0 });
    try {
      const { exercises, hasMore } = await fetchExercises(PAGE_SIZE, 0);
      set({ exercises, hasMore, offset: PAGE_SIZE, loading: false });
    } catch (e) {
      set({ error: toErrorMessage(e), loading: false });
    }
  },

  loadMore: async () => {
    const { loadingMore, hasMore, offset } = get();
    if (loadingMore || !hasMore) return;
    set({ loadingMore: true });
    try {
      const result = await fetchExercises(PAGE_SIZE, offset);
      set((s) => ({
        exercises: [...s.exercises, ...result.exercises],
        hasMore: result.hasMore,
        offset: s.offset + PAGE_SIZE,
        loadingMore: false,
      }));
    } catch (e) {
      console.warn('[exerciseStore] loadMore failed:', toErrorMessage(e));
      set({ loadingMore: false });
    }
  },

  loadCategories: async () => {
    try {
      const categories = await fetchCategories();
      set({ categories });
    } catch (e) {
      console.warn('[exerciseStore] loadCategories failed:', toErrorMessage(e));
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (id) => set({ selectedCategory: id }),

  filteredExercises: () => {
    const { exercises, searchQuery, selectedCategory } = get();
    let result = exercises;
    if (selectedCategory) {
      result = result.filter((e) => e.categoryId === selectedCategory);
    }
    return searchItems(searchQuery, result, (e) => [e.name, e.category]);
  },
}));
