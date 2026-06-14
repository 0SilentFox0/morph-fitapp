import { useTrainingHistoryStore } from '../../store/trainingHistoryStore';
import { mockClients, mockSessions, CURRENT_USER_NAME } from '../../mocks';
import type { CompletedTraining } from '../../types';

const seed = useTrainingHistoryStore.getState().history;

const sampleHistory: CompletedTraining[] = [
  {
    id: 'a',
    clientName: 'Alice Smith',
    programId: '1',
    date: 'Dec 1',
    exercises: [{ exerciseId: 10, sets: [{ weight: 30, reps: 10 }] }],
  },
  {
    id: 'b',
    clientName: 'alice smith', // different casing -> same client
    programId: '1',
    date: 'Dec 8',
    exercises: [{ exerciseId: 10, sets: [{ weight: 35, reps: 8 }] }],
  },
];

afterEach(() => {
  useTrainingHistoryStore.setState({ history: seed });
});

describe('useTrainingHistoryStore', () => {
  it('getLastSets returns the most recent matching training (case-insensitive name)', () => {
    useTrainingHistoryStore.setState({ history: sampleHistory });
    expect(useTrainingHistoryStore.getState().getLastSets('Alice Smith', 10)).toEqual([
      { weight: 35, reps: 8 },
    ]);
  });

  it('getLastSets returns null when the client has no log for the exercise', () => {
    useTrainingHistoryStore.setState({ history: sampleHistory });
    expect(useTrainingHistoryStore.getState().getLastSets('Alice Smith', 999)).toBeNull();
    expect(useTrainingHistoryStore.getState().getLastSets('Nobody', 10)).toBeNull();
  });

  it('seeds mock history that resolves known demo clients', () => {
    // Brooklyn Simmons did Back squat (301) in the seed
    expect(useTrainingHistoryStore.getState().getLastSets('Brooklyn Simmons', 301)).not.toBeNull();
  });

  it('getCurrentUserHistory returns the signed-in client\'s own trainings', () => {
    const history = useTrainingHistoryStore.getState().getCurrentUserHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history.every((h) => h.clientName === CURRENT_USER_NAME)).toBe(true);
  });

  it('seeds history for every demo client so the progress chart always has data', () => {
    const { getClientHistory } = useTrainingHistoryStore.getState();
    const names = Array.from(
      new Set([
        ...mockClients.map((c) => c.name),
        ...mockSessions.flatMap((s) => s.participants.map((p) => p.name)),
      ]),
    );
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(getClientHistory(name).length).toBeGreaterThan(0);
    }
  });
});
