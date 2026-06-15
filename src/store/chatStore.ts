import { create } from 'zustand';

import { searchItems } from '../utils/common/search';

/** Avatar tint pairs (background + foreground) for initials placeholders, per Figma. */
export type AvatarTint = 'primary' | 'blue' | 'success';

export interface ChatParticipant {
  id: string;
  name: string;
  /** Photo URL; when absent, initials on a tinted background are shown. */
  avatar?: string | null;
  /** Tint used for the initials placeholder when there is no photo. */
  tint?: AvatarTint;
}

/** Delivery state shown as a single / double check on the list row. */
export type MessageStatus = 'sent' | 'delivered' | 'read';

/**
 * A chat message. Beyond plain text, the design embeds rich cards in the
 * thread: a session invite card ("Single Training") and a "Session started"
 * timer card. These are modelled as message variants so they live inline in
 * the message stream just like the Figma design.
 */
export type ChatMessage =
  | {
      kind: 'text';
      id: string;
      text: string;
      sentAt: string;
      isFromMe: boolean;
      status: MessageStatus;
    }
  | {
      kind: 'session';
      id: string;
      sentAt: string;
      isFromMe: boolean;
      status: MessageStatus;
      session: {
        title: string;
        date: string;
        time: string;
        participants: number;
      };
    }
  | {
      kind: 'sessionStarted';
      id: string;
      sentAt: string;
      isFromMe: boolean;
      status: MessageStatus;
    };

export interface Conversation {
  id: string;
  participant: ChatParticipant;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  /** Status of the last outgoing message; drives the check-mark on the row. */
  lastMessageStatus: MessageStatus | null;
  /** Whether the last message was sent by me (controls the check-mark display). */
  lastMessageFromMe: boolean;
  unreadCount: number;
}

interface ChatState {
  conversations: Conversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  addConversation: (participant: ChatParticipant) => Conversation;
  getOrCreateConversation: (
    participantId: string,
    participant: ChatParticipant
  ) => Conversation;
  sendMessage: (conversationId: string, text: string) => ChatMessage;
  markAsRead: (conversationId: string) => void;
  searchConversations: (query: string) => Conversation[];
  getUnreadCount: () => number;
}

let nextConvId = 100;

let nextMsgId = 1;

// --- Mock conversations (Chat list) -------------------------------------------------
// Names, avatar tints and read-receipt states mirror Figma node 2006:10239.
const listParticipants: {
  participant: ChatParticipant;
  unread: number;
  fromMe: boolean;
  status: MessageStatus;
}[] = [
  {
    participant: {
      id: '1',
      name: 'Jacob Jones',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    unread: 2,
    fromMe: false,
    status: 'delivered',
  },
  {
    participant: {
      id: '2',
      name: 'Dianne Russell',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    unread: 3,
    fromMe: false,
    status: 'delivered',
  },
  {
    participant: { id: '3', name: 'Brooklyn Simmons', tint: 'primary' },
    unread: 0,
    fromMe: true,
    status: 'read',
  },
  {
    participant: {
      id: '4',
      name: 'Jerome Bell',
      avatar: 'https://i.pravatar.cc/150?img=33',
    },
    unread: 0,
    fromMe: true,
    status: 'sent',
  },
  {
    participant: { id: '5', name: 'Cameron Williamson', tint: 'blue' },
    unread: 0,
    fromMe: true,
    status: 'read',
  },
  {
    participant: {
      id: '6',
      name: 'Ronald Richards',
      avatar: 'https://i.pravatar.cc/150?img=52',
    },
    unread: 0,
    fromMe: true,
    status: 'read',
  },
  {
    participant: {
      id: '7',
      name: 'Brooklyn Simmons',
      avatar: 'https://i.pravatar.cc/150?img=47',
    },
    unread: 0,
    fromMe: true,
    status: 'read',
  },
  {
    participant: { id: '8', name: 'Eleanor Pena', tint: 'success' },
    unread: 0,
    fromMe: true,
    status: 'sent',
  },
  {
    participant: {
      id: '9',
      name: 'Savannah Nguyen',
      avatar: 'https://i.pravatar.cc/150?img=15',
    },
    unread: 0,
    fromMe: true,
    status: 'read',
  },
];

const initialConversations: Conversation[] = listParticipants.map((row, i) => ({
  id: `c${i + 1}`,
  participant: row.participant,
  lastMessagePreview: 'Thanks for the workout plan!',
  lastMessageAt: '2025-03-01T10:30:00Z',
  lastMessageStatus: row.status,
  lastMessageFromMe: row.fromMe,
  unreadCount: row.unread,
}));

// --- Mock thread (Morning Warriors group) -------------------------------------------
// Mirrors Figma node 2006:10366 — bubbles, a session card and a timer card.
const morningWarriorsMessages: ChatMessage[] = [
  {
    kind: 'text',
    id: 'mw1',
    text: 'Good morning !',
    sentAt: '2025-03-16T08:00:00Z',
    isFromMe: true,
    status: 'read',
  },
  {
    kind: 'session',
    id: 'mw2',
    sentAt: '2025-03-16T08:05:00Z',
    isFromMe: false,
    status: 'read',
    session: {
      title: 'Single Training',
      date: 'Mar 16, 2026',
      time: '6:00 AM',
      participants: 8,
    },
  },
  {
    kind: 'sessionStarted',
    id: 'mw3',
    sentAt: '2025-03-16T09:00:00Z',
    isFromMe: false,
    status: 'read',
  },
  {
    kind: 'text',
    id: 'mw4',
    text: 'See you all tomorrow at 6AM',
    sentAt: '2025-03-16T09:15:00Z',
    isFromMe: true,
    status: 'read',
  },
  {
    kind: 'text',
    id: 'mw5',
    text: 'Thanks for the workout plan!',
    sentAt: '2025-03-16T09:20:00Z',
    isFromMe: false,
    status: 'read',
  },
];

const initialMessages: Record<string, ChatMessage[]> = {
  c1: morningWarriorsMessages,
};

function previewOf(msg: ChatMessage): string {
  switch (msg.kind) {
    case 'text':
      return msg.text;
    case 'session':
      return `Session: ${msg.session.title}`;
    case 'sessionStarted':
      return 'Session started';
  }
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: initialConversations,
  messagesByConversation: initialMessages,

  addConversation: (participant) => {
    const id = `c${nextConvId++}`;

    const conv: Conversation = {
      id,
      participant,
      lastMessagePreview: null,
      lastMessageAt: null,
      lastMessageStatus: null,
      lastMessageFromMe: false,
      unreadCount: 0,
    };

    set((s) => ({
      conversations: [conv, ...s.conversations],
      messagesByConversation: { ...s.messagesByConversation, [id]: [] },
    }));

    return conv;
  },

  getOrCreateConversation: (participantId, participant) => {
    const existing = get().conversations.find(
      (c) => c.participant.id === participantId
    );

    if (existing) return existing;

    return get().addConversation(participant);
  },

  sendMessage: (conversationId, text) => {
    const msg: ChatMessage = {
      kind: 'text',
      id: `msg${nextMsgId++}`,
      text,
      sentAt: new Date().toISOString(),
      isFromMe: true,
      status: 'sent',
    };

    set((s) => {
      const messages = [
        ...(s.messagesByConversation[conversationId] ?? []),
        msg,
      ];

      const conv = s.conversations.find((c) => c.id === conversationId);

      const updated = conv
        ? s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessagePreview: previewOf(msg),
                  lastMessageAt: msg.sentAt,
                  lastMessageStatus: msg.status,
                  lastMessageFromMe: true,
                  unreadCount: 0,
                }
              : c
          )
        : s.conversations;

      return {
        messagesByConversation: {
          ...s.messagesByConversation,
          [conversationId]: messages,
        },
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

  searchConversations: (query) =>
    searchItems(query, get().conversations, (c) => [c.participant.name]),

  getUnreadCount: () =>
    get().conversations.reduce((acc, c) => acc + c.unreadCount, 0),
}));
