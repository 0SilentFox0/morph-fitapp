import type {
  Conversation as ApiConversation,
  Message as ApiMessage,
} from '../../schemas/api/models';
import {
  apiConversationToUi,
  apiMessageToUi,
} from '../../services/repositories/chatRepository';

const ME = 'me-uuid';

describe('apiMessageToUi', () => {
  const msg: ApiMessage = {
    id: 'm1',
    conversation_id: 'c1',
    sender_id: 'other-uuid',
    body: 'Hello',
    media_file_ids: [],
    sent_at: '2026-06-15T10:00:00Z',
    deleted_at: null,
  };

  it('maps an incoming message (not from me)', () => {
    expect(apiMessageToUi(msg, ME)).toMatchObject({
      kind: 'text',
      id: 'm1',
      text: 'Hello',
      isFromMe: false,
    });
  });

  it('flags a message I sent as isFromMe', () => {
    expect(apiMessageToUi({ ...msg, sender_id: ME }, ME).isFromMe).toBe(true);
  });
});

describe('apiConversationToUi', () => {
  const conv: ApiConversation = {
    id: 'c1',
    last_message_at: '2026-06-15T10:00:00Z',
    participants: [{ user_id: ME, last_read_at: null }, { user_id: 'other-uuid', last_read_at: null }],
    last_message: {
      id: 'm1',
      conversation_id: 'c1',
      sender_id: 'other-uuid',
      body: 'Thanks!',
      media_file_ids: [],
      sent_at: '2026-06-15T10:00:00Z',
      deleted_at: null,
    },
    unread_count: 2,
  };

  it('uses the other participant and the last message preview + unread count', () => {
    const ui = apiConversationToUi(conv, ME);

    expect(ui.id).toBe('c1');
    expect(ui.participant.id).toBe('other-uuid');
    expect(ui.lastMessagePreview).toBe('Thanks!');
    expect(ui.unreadCount).toBe(2);
    expect(ui.lastMessageFromMe).toBe(false);
  });
});
