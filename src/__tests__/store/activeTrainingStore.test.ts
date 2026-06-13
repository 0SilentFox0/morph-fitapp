import { useActiveTrainingStore, type ActiveClient } from '../../store/activeTrainingStore';

function makeClient(over: Partial<ActiveClient> = {}): ActiveClient {
  return {
    clientId: 'c1',
    name: 'Alice',
    programId: 'p1',
    exerciseIndex: 0,
    setIndex: 0,
    setLog: { 1: [{ weight: 40, reps: 10 }, { weight: 45, reps: 8 }] },
    prevSets: {},
    rest: { running: false, remainingSec: 0, durationSec: 0 },
    ...over,
  };
}

beforeEach(() => {
  useActiveTrainingStore.setState({ clients: [], activeClientId: null });
});

describe('useActiveTrainingStore', () => {
  it('startTraining selects the first client by default', () => {
    const a = makeClient({ clientId: 'c1' });
    const b = makeClient({ clientId: 'c2', name: 'Bob' });
    useActiveTrainingStore.getState().startTraining([a, b]);
    expect(useActiveTrainingStore.getState().activeClientId).toBe('c1');
  });

  it('startTraining honors an explicit active client when present', () => {
    const a = makeClient({ clientId: 'c1' });
    const b = makeClient({ clientId: 'c2' });
    useActiveTrainingStore.getState().startTraining([a, b], 'c2');
    expect(useActiveTrainingStore.getState().activeClientId).toBe('c2');
  });

  it('keeps each client’s set index independent when switching', () => {
    useActiveTrainingStore
      .getState()
      .startTraining([makeClient({ clientId: 'c1' }), makeClient({ clientId: 'c2' })]);
    const store = useActiveTrainingStore.getState();
    store.setSetIndex('c1', 1);
    store.setSetIndex('c2', 0);

    const clients = useActiveTrainingStore.getState().clients;
    expect(clients.find((c) => c.clientId === 'c1')!.setIndex).toBe(1);
    expect(clients.find((c) => c.clientId === 'c2')!.setIndex).toBe(0);
  });

  it('updateSet edits only the targeted set of the targeted client', () => {
    useActiveTrainingStore.getState().startTraining([makeClient()]);
    useActiveTrainingStore.getState().updateSet('c1', 1, 0, { weight: 50 });
    const sets = useActiveTrainingStore.getState().clients[0]!.setLog[1]!;
    expect(sets[0]).toEqual({ weight: 50, reps: 10 });
    expect(sets[1]).toEqual({ weight: 45, reps: 8 });
  });

  it('toggleRepToFailure flips the failure note', () => {
    useActiveTrainingStore.getState().startTraining([makeClient()]);
    useActiveTrainingStore.getState().toggleRepToFailure('c1', 1, 0);
    expect(useActiveTrainingStore.getState().clients[0]!.setLog[1]![0]!.note).toBe('failure');
    useActiveTrainingStore.getState().toggleRepToFailure('c1', 1, 0);
    expect(useActiveTrainingStore.getState().clients[0]!.setLog[1]![0]!.note).toBe('regular');
  });

  it('tickRest decrements every running client and stops each at zero', () => {
    useActiveTrainingStore
      .getState()
      .startTraining([makeClient({ clientId: 'c1' }), makeClient({ clientId: 'c2' })], 'c1');
    const store = useActiveTrainingStore.getState();
    store.startRest('c1', 2);
    store.startRest('c2', 3);

    // Both timers keep counting even though only c1 is active.
    useActiveTrainingStore.getState().tickRest();
    let clients = useActiveTrainingStore.getState().clients;
    expect(clients.find((c) => c.clientId === 'c1')!.rest.remainingSec).toBe(1);
    expect(clients.find((c) => c.clientId === 'c2')!.rest.remainingSec).toBe(2);

    useActiveTrainingStore.getState().tickRest();
    clients = useActiveTrainingStore.getState().clients;
    const c1 = clients.find((c) => c.clientId === 'c1')!;
    expect(c1.rest.remainingSec).toBe(0);
    expect(c1.rest.running).toBe(false);
    // c2 still has time and keeps running
    expect(clients.find((c) => c.clientId === 'c2')!.rest.running).toBe(true);
  });

  it('openExercise points a client at a program + exercise and resets the set', () => {
    useActiveTrainingStore.getState().startTraining([makeClient({ setIndex: 2 })]);
    useActiveTrainingStore.getState().openExercise('c1', 'p9', 3);
    const c = useActiveTrainingStore.getState().clients[0]!;
    expect(c.programId).toBe('p9');
    expect(c.exerciseIndex).toBe(3);
    expect(c.setIndex).toBe(0);
  });
});
