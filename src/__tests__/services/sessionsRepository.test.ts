import type { Session as ApiSession } from '../../schemas/api/models';
import * as meApi from '../../services/api/me';
import * as sessionsApi from '../../services/api/sessions';
import {
  apiSessionToUi,
  buildSessionInput,
  createSession,
  loadClientSessions,
} from '../../services/repositories/sessionsRepository';

afterEach(() => jest.restoreAllMocks());

const form = {
  title: '  Morning session  ',
  type: 'Cardio',
  date: new Date(2026, 5, 15, 0, 0, 0, 0),
  time: new Date(2026, 5, 15, 8, 30, 0, 0),
  programId: undefined as string | undefined,
};

describe('buildSessionInput', () => {
  it('merges date + time into an ISO start_at and a default 60-min end_at', () => {
    const input = buildSessionInput({ ...form });

    expect(input.title).toBe('Morning session');
    expect(input.type).toBe('Cardio');

    const start = new Date(input.start_at);

    const end = new Date(input.end_at);

    // start carries the picked time-of-day (compare in local time)
    expect(start.getHours()).toBe(8);
    expect(start.getMinutes()).toBe(30);
    expect(end.getTime() - start.getTime()).toBe(60 * 60 * 1000);
  });

  it('omits program_id when it is not a real UUID (still mock data)', () => {
    expect(buildSessionInput({ ...form, programId: 'p1' }).program_id).toBeUndefined();
  });

  it('forwards a UUID program_id', () => {
    const uuid = '11111111-1111-4111-8111-111111111111';

    expect(buildSessionInput({ ...form, programId: uuid }).program_id).toBe(uuid);
  });
});

describe('apiSessionToUi', () => {
  const apiSession = {
    id: 's1',
    trainer_id: 'tr1',
    title: 'Leg Day',
    type: 'Strength',
    start_at: '2026-06-15T08:30:00.000Z',
    end_at: '2026-06-15T09:30:00.000Z',
    status: 'planned',
    program_id: 'prog1',
    participants: [
      { session_id: 's1', client_id: 'c1', client: { name: 'Bob' } },
    ],
  } as unknown as ApiSession;

  it('labels the date "Today" relative to now and maps status + participants', () => {
    const now = new Date();

    const start = new Date(now);

    start.setHours(10, 0, 0, 0);

    const ui = apiSessionToUi(
      { ...apiSession, start_at: start.toISOString() } as ApiSession,
      now
    );

    expect(ui.date).toBe('Today');
    expect(ui.status).toBe('pending'); // planned → pending
    expect(ui.participants).toEqual([
      { id: 'c1', name: 'Bob', avatar: undefined },
    ]);
    expect(ui.programId).toBe('prog1');
  });

  it('labels the next day "Tomorrow" and collapses no_show → canceled', () => {
    const now = new Date();

    now.setHours(9, 0, 0, 0);

    const start = new Date(now);

    start.setDate(start.getDate() + 1);

    const ui = apiSessionToUi(
      {
        ...apiSession,
        start_at: start.toISOString(),
        status: 'no_show',
      } as ApiSession,
      now
    );

    expect(ui.date).toBe('Tomorrow');
    expect(ui.status).toBe('canceled');
  });

  it('falls back to "Client" when the participant has no embedded user', () => {
    const ui = apiSessionToUi(
      {
        ...apiSession,
        participants: [{ session_id: 's1', client_id: 'c9', client: null }],
      } as ApiSession,
      new Date()
    );

    expect(ui.participants[0]).toMatchObject({ id: 'c9', name: 'Client' });
  });
});

describe('createSession', () => {
  it('calls the live API with the built input when sessions are ready', async () => {
    const spy = jest.spyOn(sessionsApi, 'createSession').mockResolvedValue({
      data: { id: 's1' },
    } as never);

    const result = await createSession({ ...form, title: 'Leg Day' });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Leg Day', type: 'Cardio' })
    );
    expect(result.id).toBe('s1');
  });
});

describe('loadClientSessions', () => {
  it('fetches GET /me/sessions and adapts to UI sessions', async () => {
    const spy = jest.spyOn(meApi, 'getMySessions').mockResolvedValue({
      data: [
        {
          id: 's7',
          trainer_id: 'tr1',
          title: 'My session',
          type: 'Strength',
          start_at: '2026-06-20T08:30:00.000Z',
          status: 'planned',
          participants: [],
        },
      ],
    } as never);

    const sessions = await loadClientSessions();

    expect(spy).toHaveBeenCalledWith({ per_page: 100 });
    expect(sessions[0]).toMatchObject({ id: 's7', title: 'My session', status: 'pending' });
  });
});
