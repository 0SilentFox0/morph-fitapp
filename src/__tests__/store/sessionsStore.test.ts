import { useSessionsStore } from '../../store/sessionsStore';
import type { Session } from '../../mocks';

const initialSessions = useSessionsStore.getState().sessions;

function makeSession(overrides: Partial<Session> = {}): Omit<Session, 'id'> {
  return {
    title: 'Test Session',
    type: 'Strength',
    date: 'Today',
    time: '10:00am',
    status: 'pending',
    participants: [{ id: 'p1', name: 'Alice' }],
    ...overrides,
  };
}

beforeEach(() => {
  useSessionsStore.setState({ sessions: [...initialSessions] });
});

describe('useSessionsStore', () => {
  it('addSession appends a session with a unique string id', () => {
    const before = useSessionsStore.getState().sessions.length;
    useSessionsStore.getState().addSession(makeSession({ title: 'A' }));
    useSessionsStore.getState().addSession(makeSession({ title: 'B' }));

    const sessions = useSessionsStore.getState().sessions;
    expect(sessions).toHaveLength(before + 2);
    const added = sessions.slice(-2);
    expect(typeof added[0]!.id).toBe('string');
    expect(added[0]!.id).not.toBe(added[1]!.id);
  });

  it('updateSession merges updates by id', () => {
    useSessionsStore.getState().addSession(makeSession({ title: 'Original' }));
    const id = useSessionsStore.getState().sessions.at(-1)!.id;

    useSessionsStore.getState().updateSession(id, { title: 'Renamed', status: 'completed' });

    const updated = useSessionsStore.getState().sessions.find((s) => s.id === id)!;
    expect(updated.title).toBe('Renamed');
    expect(updated.status).toBe('completed');
    expect(updated.type).toBe('Strength');
  });

  it('deleteSession removes the matching session', () => {
    useSessionsStore.getState().addSession(makeSession({ title: 'ToDelete' }));
    const id = useSessionsStore.getState().sessions.at(-1)!.id;

    useSessionsStore.getState().deleteSession(id);

    expect(useSessionsStore.getState().sessions.some((s) => s.id === id)).toBe(false);
  });

  it('searchSessions matches title, type, and participant name; empty query returns all', () => {
    useSessionsStore.setState({
      sessions: [
        {
          id: 'x1',
          ...makeSession({
            title: 'Morning Yoga',
            type: 'Yoga',
            participants: [{ id: 'p', name: 'Bob' }],
          }),
        },
        {
          id: 'x2',
          ...makeSession({
            title: 'Sprint',
            type: 'Cardio',
            participants: [{ id: 'p', name: 'Carol' }],
          }),
        },
      ],
    });

    expect(
      useSessionsStore
        .getState()
        .searchSessions('yoga')
        .map((s) => s.id)
    ).toEqual(['x1']);
    expect(
      useSessionsStore
        .getState()
        .searchSessions('cardio')
        .map((s) => s.id)
    ).toEqual(['x2']);
    expect(
      useSessionsStore
        .getState()
        .searchSessions('carol')
        .map((s) => s.id)
    ).toEqual(['x2']);
    expect(useSessionsStore.getState().searchSessions('   ')).toHaveLength(2);
  });

  it('getUpcomingSessions excludes canceled sessions', () => {
    useSessionsStore.setState({
      sessions: [
        { id: 'a', ...makeSession({ status: 'pending' }) },
        { id: 'b', ...makeSession({ status: 'canceled' }) },
        { id: 'c', ...makeSession({ status: 'completed' }) },
      ],
    });

    const ids = useSessionsStore
      .getState()
      .getUpcomingSessions()
      .map((s) => s.id);
    expect(ids).toEqual(['a', 'c']);
  });

  it('getTodaySessions returns only sessions dated "Today"', () => {
    useSessionsStore.setState({
      sessions: [
        { id: 'a', ...makeSession({ date: 'Today' }) },
        { id: 'b', ...makeSession({ date: 'Tomorrow' }) },
      ],
    });

    expect(
      useSessionsStore
        .getState()
        .getTodaySessions()
        .map((s) => s.id)
    ).toEqual(['a']);
  });
});
