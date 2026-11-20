/**
 * REST API calls for the HU-11 chat module.
 * Base URL: /api/v1/chats
 *
 * All endpoints require a valid JWT Bearer token.
 */
import { apiClient } from './client.js';
import type { ApiResponse } from '../interfaces/auth.interface.js';
import type { Conversation, ChatMessage, ChatContact } from '../interfaces/chat.interface.js';

export const chatApi = {
  /**
   * GET /api/v1/chats
   * Returns all conversations for the authenticated user, ordered by most recent activity.
   */
  getConversations: async (): Promise<Conversation[]> => {
    const res = await apiClient.get<ApiResponse<Conversation[]>>('/v1/chats');
    return res.data?.data ?? [];
  },

  /**
   * POST /api/v1/chats
   * Finds or creates a conversation with the given peer (optionally scoped to a project).
   */
  createOrFindConversation: async (payload: {
    peerId: string;
    projectId?: string | null;
    projectName?: string;
  }): Promise<Conversation> => {
    const res = await apiClient.post<ApiResponse<Conversation>>('/v1/chats', payload);
    if (!res.data?.data) throw new Error('Invalid server response when creating conversation');
    return res.data.data;
  },

  /**
   * GET /api/v1/chats/:conversationId/messages
   * Returns the full message history for a conversation.
   * Returns 403 if the authenticated user is not a participant.
   */
  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const res = await apiClient.get<ApiResponse<ChatMessage[]>>(
      `/v1/chats/${conversationId}/messages`
    );
    return res.data?.data ?? [];
  },

  /**
   * POST /api/v1/chats/:conversationId/messages
   * Sends a text message; triggers socket broadcast on the backend automatically.
   */
  sendMessage: async (conversationId: string, content: string): Promise<ChatMessage> => {
    const res = await apiClient.post<ApiResponse<ChatMessage>>(
      `/v1/chats/${conversationId}/messages`,
      { content }
    );
    if (!res.data?.data) throw new Error('Invalid server response when sending message');
    return res.data.data;
  },

  /**
   * PATCH /api/v1/chats/:conversationId/read
   * Marks all received messages in the conversation as read.
   */
  markAsRead: async (conversationId: string): Promise<{ updatedCount: number }> => {
    const res = await apiClient.patch<ApiResponse<{ updatedCount: number }>>(
      `/v1/chats/${conversationId}/read`
    );
    return res.data?.data ?? { updatedCount: 0 };
  },

  /**
   * GET /api/v1/chats/contacts?search=
   * Searches platform users (excluding self) to start a new conversation.
   */
  getContacts: async (search?: string): Promise<ChatContact[]> => {
    const params = search ? { search } : {};
    const res = await apiClient.get<ApiResponse<ChatContact[]>>('/v1/chats/contacts', { params });
    return res.data?.data ?? [];
  },
};
