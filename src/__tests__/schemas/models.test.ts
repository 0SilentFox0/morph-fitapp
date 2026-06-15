import { UserSchema, ClientSchema, SessionSchema, TokenResponseSchema } from '../../schemas/api/models';

describe('api model schemas', () => {
  it('parses a minimal User', () => {
    const u = UserSchema.parse({
      id: 'u1', email: 'a@b.com', name: 'Jane', role: 'trainer', created_at: '2026-01-01T00:00:00Z',
    });
    expect(u.role).toBe('trainer');
    expect(u.certifications).toEqual([]); // defaulted
  });

  it('parses a Client with nullable fields absent', () => {
    const c = ClientSchema.parse({ id: 'c1', trainer_id: 't1', name: 'Bob', type: 'personal', status: 'active' });
    expect(c.tags).toEqual([]);
  });

  it('parses a Session with an empty participants list', () => {
    const s = SessionSchema.parse({ id: 's1', trainer_id: 't1', title: 'Leg day', status: 'planned' });
    expect(s.participants).toEqual([]);
  });

  it('parses a TokenResponse', () => {
    const t = TokenResponseSchema.parse({
      access_token: 'a', refresh_token: 'r', expires_at: '2026-01-01T00:00:00Z', token_type: 'Bearer',
    });
    expect(t.access_token).toBe('a');
  });
});
