import { apiReadiness } from '../../config/apiReadiness';
import type {
  Conversation as ApiConversation,
  Message as ApiMessage,
} from '../../schemas/api/models';
import { useAuthStore } from '../../store/authStore';
import {
  type ChatMessage,
  type Conversation,
  useChatStore,
} from '../../store/chatStore';
import * as chatApi from '../api/chat';
import { withMockFallback } from '../mockFallback';

/**
 * Single entry point for chat data. Both the conversation LIST and the message
 * THREAD go through here behind one `apiReadiness.chat` flag, so the live
 * migration is a single atomic flip (the list + thread were previously coupled
 * through the mock `chatStore`). The flag stays `false` until the backend
 * real-time path (B6) is ready; until then every call serves the existing mock.
 *
 * Backend gaps to close before flipping the flag (see FRONTEND_INTEGRATION_CHANGES.md):
 * - `ConversationParticipant` carries only `user_id` — no name/avatar — so the
 *   list row has no display name. The conversation payload must embed a
 *   participant summary (name, avatar_url).
 * - `Message` has no per-message delivery status; the UI defaults to 'sent'.
 */

/** Pure adapter: API message → UI `ChatMessage` (text variant). */
export function apiMessageToUi(
  msg: ApiMessage,
  currentUserId: string
): ChatMessage {
  return {
    kind: 'text',
    id: msg.id,
    text: msg.body ?? '',
    sentAt: msg.sent_at ?? '',
    isFromMe: msg.sender_id === currentUserId,
    status: 'sent',
  };
}

/** Pure adapter: API conversation → UI `Conversation` (list row). */
export function apiConversationToUi(
  conv: ApiConversation,
  currentUserId: string
): Conversation {
  const other =
    conv.participants.find((p) => p.user_id !== currentUserId) ??
    conv.participants[0];

  const lastFromMe = conv.last_message?.sender_id === currentUserId;

  return {
    id: conv.id,
    participant: {
      id: other?.user_id ?? '',
      // Name/avatar are not in the conversation payload yet (backend gap).
      name: '',
    },
    lastMessagePreview: conv.last_message?.body ?? null,
    lastMessageAt: conv.last_message_at ?? null,
    lastMessageStatus: conv.last_message ? 'sent' : null,
    lastMessageFromMe: lastFromMe,
    unreadCount: conv.unread_count,
  };
}

function currentUserId(): string {
  return useAuthStore.getState().user?.id ?? '';
}

/** Load the conversation list. Live behind `apiReadiness.chat`. */
export async function loadConversations(): Promise<Conversation[]> {
  return withMockFallback(
    apiReadiness.chat,
    async () => {
      const res = await chatApi.listConversations();

      const me = currentUserId();

      return res.data.map((c) => apiConversationToUi(c, me));
    },
    () => useChatStore.getState().conversations
  );
}

/** Load the messages for a thread. Live behind `apiReadiness.chat`. */
export async function loadMessages(
  conversationId: string
): Promise<ChatMessage[]> {
  return withMockFallback(
    apiReadiness.chat,
    async () => {
      const res = await chatApi.listMessages(conversationId);

      const me = currentUserId();

      return res.data.map((m) => apiMessageToUi(m, me));
    },
    () => useChatStore.getState().messagesByConversation[conversationId] ?? []
  );
}

/** Send a text message. Live behind `apiReadiness.chat`. */
export async function sendMessage(
  conversationId: string,
  text: string
): Promise<ChatMessage> {
  return withMockFallback(
    apiReadiness.chat,
    async () => {
      const res = await chatApi.sendMessage(conversationId, { body: text });

      return apiMessageToUi(res.data, currentUserId());
    },
    () => useChatStore.getState().sendMessage(conversationId, text)
  );
}
