import { apiFetch } from '../../services/apiClient';
import { fetchExercises, fetchCategories } from '../../services/exerciseApi';

jest.mock('../../services/apiClient');

const mockedApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('exerciseApi response validation', () => {
  it('fetchExercises throws a concise error when the payload is malformed', async () => {
    mockedApiFetch.mockResolvedValue({ nope: true });
    await expect(fetchExercises()).rejects.toThrow(
      'Received an unexpected exercises response from the server.'
    );
  });

  it('fetchCategories throws a concise error when the payload is malformed', async () => {
    mockedApiFetch.mockResolvedValue('not-an-object');
    await expect(fetchCategories()).rejects.toThrow(
      'Received an unexpected categories response from the server.'
    );
  });

  it('fetchExercises maps a well-formed payload into Exercise objects', async () => {
    mockedApiFetch.mockResolvedValue({
      count: 1,
      next: null,
      results: [
        {
          id: 7,
          category: { id: 10, name: 'Legs' },
          images: [],
          muscles: [],
          translations: [{ language: 2, name: 'Squat', description: '<p>Do it</p>' }],
        },
      ],
    });

    const { exercises, hasMore } = await fetchExercises();
    expect(hasMore).toBe(false);
    expect(exercises[0]).toMatchObject({
      id: 7,
      name: 'Squat',
      category: 'Legs',
      description: 'Do it',
    });
  });
});
