import { useActiveTrainingStore, type SessionParticipant } from '../../store/activeTrainingStore';

function makeParticipant(over: Partial<SessionParticipant> = {}): SessionParticipant {
  return {
    participantId: 'c1',
    name: 'Alice',
    programId: 'p1',
    exercises: [
      { id: 1, name: 'Ex', category: 'C', imageUrl: null, sets: [{ weight: 40, reps: 10 }] },
    ],
    exerciseIndex: 0,
    setIndex: 0,
    setLog: { 1: [{ weight: 40, reps: 10 }, { weight: 45, reps: 8 }] },
    prevSets: {},
    rest: { running: false, remainingSec: 0, durationSec: 0 },
    ...over,
  };
}

beforeEach(() => {
  useActiveTrainingStore.setState({ participants: [], activeParticipantId: null });
});

describe('useActiveTrainingStore', () => {
  it('startTraining selects the first participant by default', () => {
    const a = makeParticipant({ participantId: 'c1' });
    const b = makeParticipant({ participantId: 'c2', name: 'Bob' });
    useActiveTrainingStore.getState().startTraining([a, b]);
    expect(useActiveTrainingStore.getState().activeParticipantId).toBe('c1');
  });

  it('startTraining honors an explicit active participant when present', () => {
    const a = makeParticipant({ participantId: 'c1' });
    const b = makeParticipant({ participantId: 'c2' });
    useActiveTrainingStore.getState().startTraining([a, b], 'c2');
    expect(useActiveTrainingStore.getState().activeParticipantId).toBe('c2');
  });

  it("keeps each participant's set index independent when switching", () => {
    useActiveTrainingStore
      .getState()
      .startTraining([makeParticipant({ participantId: 'c1' }), makeParticipant({ participantId: 'c2' })]);
    const store = useActiveTrainingStore.getState();
    store.setSetIndex('c1', 1);
    store.setSetIndex('c2', 0);

    const participants = useActiveTrainingStore.getState().participants;
    expect(participants.find((c) => c.participantId === 'c1')!.setIndex).toBe(1);
    expect(participants.find((c) => c.participantId === 'c2')!.setIndex).toBe(0);
  });

  it('updateSet edits only the targeted set of the targeted participant', () => {
    useActiveTrainingStore.getState().startTraining([makeParticipant()]);
    useActiveTrainingStore.getState().updateSet('c1', 1, 0, { weight: 50 });
    const sets = useActiveTrainingStore.getState().participants[0]!.setLog[1]!;
    expect(sets[0]).toEqual({ weight: 50, reps: 10 });
    expect(sets[1]).toEqual({ weight: 45, reps: 8 });
  });

  it('toggleRepToFailure flips the failure note', () => {
    useActiveTrainingStore.getState().startTraining([makeParticipant()]);
    useActiveTrainingStore.getState().toggleRepToFailure('c1', 1, 0);
    expect(useActiveTrainingStore.getState().participants[0]!.setLog[1]![0]!.note).toBe('failure');
    useActiveTrainingStore.getState().toggleRepToFailure('c1', 1, 0);
    expect(useActiveTrainingStore.getState().participants[0]!.setLog[1]![0]!.note).toBe('regular');
  });

  it('tickRest decrements every running participant and stops each at zero', () => {
    useActiveTrainingStore
      .getState()
      .startTraining([makeParticipant({ participantId: 'c1' }), makeParticipant({ participantId: 'c2' })], 'c1');
    const store = useActiveTrainingStore.getState();
    store.startRest('c1', 2);
    store.startRest('c2', 3);

    useActiveTrainingStore.getState().tickRest();
    let participants = useActiveTrainingStore.getState().participants;
    expect(participants.find((c) => c.participantId === 'c1')!.rest.remainingSec).toBe(1);
    expect(participants.find((c) => c.participantId === 'c2')!.rest.remainingSec).toBe(2);

    useActiveTrainingStore.getState().tickRest();
    participants = useActiveTrainingStore.getState().participants;
    const c1 = participants.find((c) => c.participantId === 'c1')!;
    expect(c1.rest.remainingSec).toBe(0);
    expect(c1.rest.running).toBe(false);
    expect(participants.find((c) => c.participantId === 'c2')!.rest.running).toBe(true);
  });

  it('openExercise points a participant at a program + exercise and resets the set', () => {
    useActiveTrainingStore.getState().startTraining([makeParticipant({ setIndex: 2 })]);
    useActiveTrainingStore.getState().openExercise('c1', 'p9', 3);
    const c = useActiveTrainingStore.getState().participants[0]!;
    expect(c.programId).toBe('p9');
    expect(c.exerciseIndex).toBe(3);
    expect(c.setIndex).toBe(0);
  });

  it('openExercise replaces exercises when a program list is provided', () => {
    useActiveTrainingStore.getState().startTraining([makeParticipant()]);
    const next = [
      { id: 7, name: 'New', category: 'C', imageUrl: null, sets: [{ weight: 60, reps: 5 }] },
    ];
    useActiveTrainingStore.getState().openExercise('c1', 'p9', 0, next);
    expect(useActiveTrainingStore.getState().participants[0]!.exercises).toEqual(next);
  });

  it('openExercise keeps existing exercises when none are provided', () => {
    useActiveTrainingStore.getState().startTraining([makeParticipant()]);
    const before = useActiveTrainingStore.getState().participants[0]!.exercises;
    useActiveTrainingStore.getState().openExercise('c1', 'p9', 0);
    expect(useActiveTrainingStore.getState().participants[0]!.exercises).toEqual(before);
  });
});
