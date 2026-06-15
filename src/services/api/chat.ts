import { api } from './client';
import type { Query } from './client';
import { dataEnvelope, paginatedEnvelope } from '../../schemas/api/envelope';
import { ConversationSchema, MessageSchema } from '../../schemas/api/models';

export interface SendMessageInput {
  body: string;
  media_file_ids?: string[];
  client_message_id?: string;
}

export const listConversations = () =>
  api.get('/conversations', { schema: paginatedEnvelope(ConversationSchema) });

export const openConversation = (user_id: string) =>
  api.post('/conversations', { body: { user_id }, schema: dataEnvelope(ConversationSchema) });

export const listMessages = (conversationId: string, query?: Query) =>
  api.get(`/conversations/${conversationId}/messages`, { query, schema: paginatedEnvelope(MessageSchema) });

export const sendMessage = (conversationId: string, body: SendMessageInput) =>
  api.post(`/conversations/${conversationId}/messages`, { body, schema: dataEnvelope(MessageSchema) });

export const markConversationRead = (conversationId: string, message_id: string) =>
  api.post(`/conversations/${conversationId}/read`, { body: { message_id } });

export const deleteMessage = (messageId: string) => api.delete(`/messages/${messageId}`);
