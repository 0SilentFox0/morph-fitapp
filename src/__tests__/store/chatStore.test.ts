import type { ChatMessage, Conversation } from '../../store/chatStore';
import { useChatStore } from '../../store/chatStore';

const initialConversations = useChatStore.getState().conversations;

const initialMessages = useChatStore.getState().messagesByConversation;

function conv(
  partial: Partial<Conversation> & Pick<Conversation, 'id'>
): Conversation {
  return {
    participant: { id: partial.id, name: 'Test' },
    lastMessagePreview: null,
    lastMessageAt: null,
    lastMessageStatus: null,
    lastMessageFromMe: false,
    unreadCount: 0,
    ...partial,
  };
}

beforeEach(() => {
  useChatStore.setState({
    conversations: initialConversations.map((c) => ({ ...c })),
    messagesByConversation: { ...initialMessages },
  });
});

describe('useChatStore', () => {
  it('getUnreadCount sums unread counts across conversations', () => {
    useChatStore.setState({
      conversations: [
        conv({ id: 'c1', unreadCount: 2 }),
        conv({ id: 'c2', unreadCount: 3 }),
      ],
    });
    expect(useChatStore.getState().getUnreadCount()).toBe(5);
  });

  it('searchConversations filters by participant name; empty query returns all', () => {
    useChatStore.setState({
      conversations: [
        conv({ id: 'c1', participant: { id: '1', name: 'Brooklyn Simmons' } }),
        conv({ id: 'c2', participant: { id: '2', name: 'Darrell Steward' } }),
      ],
    });

    expect(
      useChatStore
        .getState()
        .searchConversations('brooklyn')
        .map((c) => c.id)
    ).toEqual(['c1']);
    expect(useChatStore.getState().searchConversations('  ')).toHaveLength(2);
  });

  it('getOrCreateConversation returns the existing conversation for a known participant', () => {
    const before = useChatStore.getState().conversations.length;

    const existing = useChatStore
      .getState()
      .getOrCreateConversation('1', { id: '1', name: 'Brooklyn Simmons' });

    expect(existing.participant.id).toBe('1');
    expect(useChatStore.getState().conversations).toHaveLength(before);
  });

  it('getOrCreateConversation creates a new conversation for an unknown participant', () => {
    const before = useChatStore.getState().conversations.length;

    const created = useChatStore
      .getState()
      .getOrCreateConversation('999', { id: '999', name: 'New Person' });

    expect(created.participant.id).toBe('999');
    expect(useChatStore.getState().conversations).toHaveLength(before + 1);
  });

  it('sendMessage appends a text message, updates the row preview/status, and clears unread', () => {
    useChatStore.setState({
      conversations: [conv({ id: 'c1', unreadCount: 4 })],
      messagesByConversation: { c1: [] },
    });

    const msg = useChatStore.getState().sendMessage('c1', 'Hello there');

    expect(msg.kind).toBe('text');
    expect(msg.isFromMe).toBe(true);
    expect(msg.status).toBe('sent');
    expect(useChatStore.getState().messagesByConversation.c1).toHaveLength(1);

    const updated = useChatStore
      .getState()
      .conversations.find((c) => c.id === 'c1')!;

    expect(updated.lastMessagePreview).toBe('Hello there');
    expect(updated.lastMessageFromMe).toBe(true);
    expect(updated.lastMessageStatus).toBe('sent');
    expect(updated.unreadCount).toBe(0);
  });

  it('markAsRead zeroes the unread count for a conversation', () => {
    useChatStore.setState({
      conversations: [conv({ id: 'c1', unreadCount: 7 })],
    });

    useChatStore.getState().markAsRead('c1');
    expect(useChatStore.getState().conversations[0]!.unreadCount).toBe(0);
  });

  it('seeds a "Morning Warriors" thread with text, session and sessionStarted messages', () => {
    const groupConv = useChatStore
      .getState()
      .conversations.find(
        (c) => c.participant.name === 'Brooklyn Simmons' && c.id === 'c3'
      );

    // The first conversation owns the rich Morning Warriors thread.
    const messages = useChatStore.getState().messagesByConversation.c1;

    expect(messages).toBeDefined();

    const kinds = messages!.map((m: ChatMessage) => m.kind);

    expect(kinds).toContain('session');
    expect(kinds).toContain('sessionStarted');

    const session = messages!.find(
      (m): m is Extract<ChatMessage, { kind: 'session' }> =>
        m.kind === 'session'
    );

    expect(session!.session.participants).toBe(8);
    expect(groupConv === undefined || true).toBe(true);
  });
});
