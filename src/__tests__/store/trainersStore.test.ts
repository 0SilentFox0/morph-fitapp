import { useTrainersStore } from '../../store/trainersStore';

const seed = useTrainersStore.getState().trainers;

afterEach(() => {
  useTrainersStore.setState({ trainers: seed, filterSpecialty: null, onlineOnly: false });
});

describe('useTrainersStore', () => {
  it('getTrainer returns a trainer by id', () => {
    expect(useTrainersStore.getState().getTrainer('t1')?.name).toBe('Marcus Reed');
    expect(useTrainersStore.getState().getTrainer('nope')).toBeUndefined();
  });

  it('search matches name, headline or specialty (case-insensitive)', () => {
    const { search } = useTrainersStore.getState();
    expect(search('marcus').map((t) => t.id)).toContain('t1');
    expect(search('hiit').length).toBeGreaterThan(0);
    expect(search('').length).toBe(seed.length);
  });

  it('search filters by specialty when provided', () => {
    const results = useTrainersStore.getState().search('', 'Yoga');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((t) => t.specialties.includes('Yoga'))).toBe(true);
  });

  it('visibleTrainers applies the shared specialty and online-only filters', () => {
    const store = useTrainersStore.getState();
    store.setFilterSpecialty('Yoga');
    expect(useTrainersStore.getState().visibleTrainers('').every((t) => t.specialties.includes('Yoga'))).toBe(true);

    useTrainersStore.getState().clearFilters();
    useTrainersStore.getState().setOnlineOnly(true);
    expect(useTrainersStore.getState().visibleTrainers('').every((t) => t.online)).toBe(true);
    expect(useTrainersStore.getState().activeFilterCount()).toBe(1);
  });

  it('connect moves a trainer from none → pending and is idempotent afterwards', () => {
    useTrainersStore.getState().connect('t1');
    expect(useTrainersStore.getState().getTrainer('t1')?.connection).toBe('pending');
    // Calling again does not regress or change state
    useTrainersStore.getState().connect('t1');
    expect(useTrainersStore.getState().getTrainer('t1')?.connection).toBe('pending');
  });
});
