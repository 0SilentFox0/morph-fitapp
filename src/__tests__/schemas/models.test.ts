import { UserSchema, ClientSchema, SessionSchema, TokenResponseSchema, ConversationSchema } from '../../schemas/api/models';

describe('api model schemas', () => {
  it('parses a Conversation with typed participants and an embedded last_message', () => {
    const c = ConversationSchema.parse({
      id: 'cv1',
      last_message_at: '2026-06-01T10:00:00Z',
      participants: [
        { user_id: 'u1', last_read_at: '2026-06-01T10:00:00Z' },
        { user_id: 'u2', last_read_at: null },
      ],
      last_message: {
        id: 'm1', conversation_id: 'cv1', sender_id: 'u1', body: 'hey', media_file_ids: [], sent_at: '2026-06-01T10:00:00Z',
      },
      unread_count: 3,
    });
    expect(c.participants[0]!.user_id).toBe('u1');
    expect(c.last_message?.body).toBe('hey');
    expect(c.unread_count).toBe(3);
  });

  it('parses a Conversation with no messages yet (null last_message, defaulted unread)', () => {
    const c = ConversationSchema.parse({ id: 'cv1', participants: [], last_message: null });
    expect(c.last_message ?? null).toBeNull();
    expect(c.unread_count).toBe(0);
  });

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
