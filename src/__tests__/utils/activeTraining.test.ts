import { deriveActiveGroup, seedActiveClient } from '../../utils/activeTraining';
import type { Session, TrainingProgram } from '../../types';

const programs: TrainingProgram[] = [
  {
    id: 'p1',
    name: 'Prog 1',
    tag: 'HIIT',
    videoCount: 1,
    views: 0,
    likes: 0,
    exercises: [
      { id: 1, name: 'Ex', category: 'C', imageUrl: null, sets: [{ weight: 40, reps: 10 }] },
    ],
  },
  {
    id: 'p2',
    name: 'Prog 2',
    tag: 'Cardio',
    videoCount: 1,
    views: 0,
    likes: 0,
    exercises: [{ id: 2, name: 'Ex2', category: 'C', imageUrl: null, sets: [{ weight: 0, reps: 20 }] }],
  },
  { id: 'p3', name: 'No exercises', tag: 'X', videoCount: 0, views: 0, likes: 0 },
];

function session(over: Partial<Session>): Session {
  return {
    id: 'x',
    title: 'Personal Session',
    type: 'HIIT',
    date: 'Today',
    time: '2:00pm',
    status: 'pending',
    participants: [{ id: 'c1', name: 'Alice' }],
    ...over,
  };
}

describe('deriveActiveGroup', () => {
  it('returns empty when there are no pending sessions today', () => {
    expect(deriveActiveGroup([session({ status: 'completed' })], programs)).toEqual([]);
    expect(deriveActiveGroup([session({ date: 'Tomorrow' })], programs)).toEqual([]);
  });

  it('groups by time slot and picks the busiest slot', () => {
    const sessions: Session[] = [
      session({ id: 'a', time: '10:00am', participants: [{ id: 'c1', name: 'Alice' }] }),
      session({ id: 'b', time: '2:00pm', participants: [{ id: 'c2', name: 'Bob' }], programId: 'p1' }),
      session({ id: 'c', time: '2:00pm', participants: [{ id: 'c3', name: 'Cara' }], programId: 'p2' }),
    ];
    const group = deriveActiveGroup(sessions, programs);
    expect(group.map((c) => c.clientId)).toEqual(['c2', 'c3']);
  });

  it('assigns each client its session program, falling back to a program with exercises', () => {
    const sessions: Session[] = [
      session({ id: 'a', participants: [{ id: 'c1', name: 'Alice' }], programId: 'p2' }),
      session({ id: 'b', participants: [{ id: 'c2', name: 'Bob' }], programId: 'p3' }),
    ];
    const group = deriveActiveGroup(sessions, programs);
    expect(group[0]!.programId).toBe('p2');
    // p3 has no exercises -> falls back to a program that does
    expect(['p1', 'p2']).toContain(group[1]!.programId);
  });
});

describe('seedActiveClient', () => {
  it('clones each exercise set into the editable setLog', () => {
    const client = seedActiveClient({ id: 'c1', name: 'Alice' }, programs[0]!);
    expect(client.setLog[1]).toEqual([{ weight: 40, reps: 10 }]);
    // mutating the seed must not affect the source program
    client.setLog[1]![0]!.weight = 99;
    expect(programs[0]!.exercises![0]!.sets[0]!.weight).toBe(40);
  });

  it('seeds prevSets from the lookup and defaults setLog to previous values', () => {
    const lookup = (_name: string, exerciseId: number) =>
      exerciseId === 1 ? [{ weight: 35, reps: 12 }] : null;
    const client = seedActiveClient({ id: 'c1', name: 'Alice' }, programs[0]!, {
      lookupPrevSets: lookup,
    });
    expect(client.prevSets[1]).toEqual([{ weight: 35, reps: 12 }]);
    // no planned sets -> setLog defaults to the previous training values
    expect(client.setLog[1]).toEqual([{ weight: 35, reps: 12 }]);
  });

  it('prefers planned sets over previous and template for setLog', () => {
    const lookup = () => [{ weight: 35, reps: 12 }];
    const client = seedActiveClient({ id: 'c1', name: 'Alice' }, programs[0]!, {
      plannedSets: { 1: [{ weight: 50, reps: 9 }] },
      lookupPrevSets: lookup,
    });
    expect(client.setLog[1]).toEqual([{ weight: 50, reps: 9 }]);
    expect(client.prevSets[1]).toEqual([{ weight: 35, reps: 12 }]);
  });
});
