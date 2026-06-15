import * as sessionsApi from '../../services/api/sessions';
import {
  buildSessionInput,
  createSession,
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
