import { fetchExercises, fetchCategories, type Exercise } from '../services/exerciseApi';
import { useExerciseStore } from './exerciseStore';

jest.mock('../services/exerciseApi');

const mockedFetchExercises = fetchExercises as jest.MockedFunction<typeof fetchExercises>;
const mockedFetchCategories = fetchCategories as jest.MockedFunction<typeof fetchCategories>;

function exercise(id: number, name: string, categoryId: number, category: string): Exercise {
  return { id, name, description: '', category, categoryId, imageUrl: null, muscles: [] };
}

beforeEach(() => {
  jest.clearAllMocks();
  useExerciseStore.setState({
    exercises: [],
    categories: [],
    loading: false,
    loadingMore: false,
    error: null,
    offset: 0,
    hasMore: true,
    searchQuery: '',
    selectedCategory: null,
  });
});

describe('useExerciseStore', () => {
  it('loadExercises populates state and clears error on success', async () => {
    mockedFetchExercises.mockResolvedValue({
      exercises: [exercise(1, 'Squat', 10, 'Legs')],
      total: 1,
      hasMore: false,
    });

    await useExerciseStore.getState().loadExercises();

    const state = useExerciseStore.getState();
    expect(state.exercises).toHaveLength(1);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.hasMore).toBe(false);
  });

  it('loadExercises records an error message on failure', async () => {
    mockedFetchExercises.mockRejectedValue(new Error('network down'));

    await useExerciseStore.getState().loadExercises();

    const state = useExerciseStore.getState();
    expect(state.error).toBe('network down');
    expect(state.loading).toBe(false);
  });

  it('loadCategories stores fetched categories', async () => {
    mockedFetchCategories.mockResolvedValue([{ id: 10, name: 'Legs' }]);

    await useExerciseStore.getState().loadCategories();

    expect(useExerciseStore.getState().categories).toEqual([{ id: 10, name: 'Legs' }]);
  });

  it('filteredExercises filters by selected category and search query', () => {
    useExerciseStore.setState({
      exercises: [
        exercise(1, 'Back Squat', 10, 'Legs'),
        exercise(2, 'Bench Press', 20, 'Chest'),
        exercise(3, 'Leg Press', 10, 'Legs'),
      ],
    });

    useExerciseStore.getState().setSelectedCategory(10);
    expect(
      useExerciseStore
        .getState()
        .filteredExercises()
        .map((e) => e.id)
    ).toEqual([1, 3]);

    useExerciseStore.getState().setSearchQuery('bench');
    useExerciseStore.getState().setSelectedCategory(null);
    expect(
      useExerciseStore
        .getState()
        .filteredExercises()
        .map((e) => e.id)
    ).toEqual([2]);
  });
});
