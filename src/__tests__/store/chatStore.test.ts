import { useChatStore } from '../../store/chatStore';

const initialConversations = useChatStore.getState().conversations;
const initialMessages = useChatStore.getState().messagesByConversation;

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
        { id: 'c1', participant: { id: '1', name: 'A' }, lastMessage: null, unreadCount: 2 },
        { id: 'c2', participant: { id: '2', name: 'B' }, lastMessage: null, unreadCount: 3 },
      ],
    });
    expect(useChatStore.getState().getUnreadCount()).toBe(5);
  });

  it('searchConversations filters by participant name; empty query returns all', () => {
    useChatStore.setState({
      conversations: [
        {
          id: 'c1',
          participant: { id: '1', name: 'Brooklyn Simmons' },
          lastMessage: null,
          unreadCount: 0,
        },
        {
          id: 'c2',
          participant: { id: '2', name: 'Darrell Steward' },
          lastMessage: null,
          unreadCount: 0,
        },
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

  it('sendMessage appends an outgoing message, updates lastMessage, and clears unread', () => {
    useChatStore.setState({
      conversations: [
        { id: 'c1', participant: { id: '1', name: 'A' }, lastMessage: null, unreadCount: 4 },
      ],
      messagesByConversation: { c1: [] },
    });

    const msg = useChatStore.getState().sendMessage('c1', 'Hello there');

    expect(msg.isFromMe).toBe(true);
    expect(msg.status).toBe('sent');
    expect(useChatStore.getState().messagesByConversation.c1).toHaveLength(1);
    const conv = useChatStore.getState().conversations.find((c) => c.id === 'c1')!;
    expect(conv.lastMessage!.text).toBe('Hello there');
    expect(conv.unreadCount).toBe(0);
  });

  it('markAsRead zeroes the unread count for a conversation', () => {
    useChatStore.setState({
      conversations: [
        { id: 'c1', participant: { id: '1', name: 'A' }, lastMessage: null, unreadCount: 7 },
      ],
    });

    useChatStore.getState().markAsRead('c1');
    expect(useChatStore.getState().conversations[0]!.unreadCount).toBe(0);
  });
});
