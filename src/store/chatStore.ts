import { create } from 'zustand';

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface ChatMessage {
  id: string;
  text: string;
  sentAt: string;
  isFromMe: boolean;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  participant: ChatParticipant;
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

interface ChatState {
  conversations: Conversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  addConversation: (participant: ChatParticipant) => Conversation;
  getOrCreateConversation: (participantId: string, participant: ChatParticipant) => Conversation;
  sendMessage: (conversationId: string, text: string) => ChatMessage;
  markAsRead: (conversationId: string) => void;
  searchConversations: (query: string) => Conversation[];
  getUnreadCount: () => number;
}

let nextConvId = 1;
let nextMsgId = 1;

const mockParticipant1: ChatParticipant = { id: '1', name: 'Brooklyn Simmons' };
const mockParticipant2: ChatParticipant = { id: '2', name: 'Darrell Steward' };
const mockParticipant3: ChatParticipant = { id: '3', name: 'Theresa Webb' };

const mockMessages1: ChatMessage[] = [
  { id: 'm1', text: 'Hi! When is our next session?', sentAt: '2025-03-01T10:00:00Z', isFromMe: false, status: 'read' },
  { id: 'm2', text: 'How about tomorrow at 10am?', sentAt: '2025-03-01T10:05:00Z', isFromMe: true, status: 'read' },
  { id: 'm3', text: 'Perfect, see you then!', sentAt: '2025-03-01T10:06:00Z', isFromMe: false, status: 'read' },
];

const mockMessages2: ChatMessage[] = [
  { id: 'm4', text: 'Can we reschedule the cardio class?', sentAt: '2025-03-01T14:30:00Z', isFromMe: false, status: 'read' },
  { id: 'm5', text: 'Sure, what time works for you?', sentAt: '2025-03-01T14:35:00Z', isFromMe: true, status: 'read' },
  { id: 'm6', text: 'Is 3pm ok?', sentAt: '2025-03-01T14:40:00Z', isFromMe: false, status: 'delivered' },
];

const initialConversations: Conversation[] = [
  {
    id: 'c1',
    participant: mockParticipant1,
    lastMessage: mockMessages1[mockMessages1.length - 1],
    unreadCount: 0,
  },
  {
    id: 'c2',
    participant: mockParticipant2,
    lastMessage: mockMessages2[mockMessages2.length - 1],
    unreadCount: 1,
  },
  {
    id: 'c3',
    participant: mockParticipant3,
    lastMessage: { id: 'm7', text: 'Thanks for the session!', sentAt: '2025-03-01T09:00:00Z', isFromMe: false, status: 'read' },
    unreadCount: 0,
  },
];

const initialMessages: Record<string, ChatMessage[]> = {
  c1: mockMessages1,
  c2: mockMessages2,
  c3: [{ id: 'm7', text: 'Thanks for the session!', sentAt: '2025-03-01T09:00:00Z', isFromMe: false, status: 'read' }],
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: initialConversations,
  messagesByConversation: initialMessages,

  addConversation: (participant) => {
    const id = `c${nextConvId++}`;
    const conv: Conversation = {
      id,
      participant,
      lastMessage: null,
      unreadCount: 0,
    };
    set((s) => ({
      conversations: [conv, ...s.conversations],
      messagesByConversation: { ...s.messagesByConversation, [id]: [] },
    }));
    return conv;
  },

  getOrCreateConversation: (participantId, participant) => {
    const existing = get().conversations.find((c) => c.participant.id === participantId);
    if (existing) return existing;
    return get().addConversation(participant);
  },

  sendMessage: (conversationId, text) => {
    const msg: ChatMessage = {
      id: `msg${nextMsgId++}`,
      text,
      sentAt: new Date().toISOString(),
      isFromMe: true,
      status: 'sent',
    };
    set((s) => {
      const messages = [...(s.messagesByConversation[conversationId] ?? []), msg];
      const conv = s.conversations.find((c) => c.id === conversationId);
      const updated = conv
        ? s.conversations.map((c) =>
            c.id === conversationId ? { ...c, lastMessage: msg, unreadCount: 0 } : c
          )
        : s.conversations;
      return {
        messagesByConversation: { ...s.messagesByConversation, [conversationId]: messages },
        conversations: updated,
      };
    });
    return msg;
  },

  markAsRead: (conversationId) => {
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    }));
  },

  searchConversations: (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return get().conversations;
    return get().conversations.filter((c) =>
      c.participant.name.toLowerCase().includes(q)
    );
  },

  getUnreadCount: () => get().conversations.reduce((acc, c) => acc + c.unreadCount, 0),
}));

export { formatTime };
