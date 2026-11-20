/**
 * Zustand store for the HU-11 Contextual Chat module.
 *
 * Responsibilities:
 *   - Hold the list of conversations (sidebar)
 *   - Hold messages for the currently open conversation
 *   - Control the drawer open/close state and which conversation is active
 *   - Expose actions consumed by components and the socket hook
 */
import { create } from 'zustand';
import { chatApi } from '../api/chat.api.js';
import type {
  Conversation,
  ChatMessage,
  ChatDrawerState,
  NewMessageSocketPayload,
  DayGroup,
} from '../interfaces/chat.interface.js';

// ── Utility helpers ───────────────────────────────────────────────────────────

/** Groups a flat list of messages into day buckets with human-readable labels */
export function groupMessagesByDay(messages: ChatMessage[]): DayGroup[] {
  const groups: Map<string, ChatMessage[]> = new Map();

  for (const msg of messages) {
    const date = new Date(msg.createdAt);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let label: string;
    if (date.toDateString() === today.toDateString()) {
      label = 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = 'Ayer';
    } else {
      label = date.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      // Capitalize first letter
      label = label.charAt(0).toUpperCase() + label.slice(1);
    }

    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(msg);
  }

  return Array.from(groups.entries()).map(([dateLabel, msgs]) => ({
    dateLabel,
    messages: msgs,
  }));
}

// ── State shape ───────────────────────────────────────────────────────────────

interface ChatState {
  // Data
  conversations: Conversation[];
  messages: ChatMessage[];
  unreadNotificationCount: number;

  // UI state
  drawer: ChatDrawerState;
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  error: string | null;

  // Computed (derived but stored for components that can't use selectors easily)
  dayGroups: DayGroup[];

  // Actions
  loadConversations: () => Promise<void>;
  openDrawer: (state: Omit<ChatDrawerState, 'isOpen'>) => void;
  closeDrawer: () => void;
  loadMessages: (conversationId: string, currentUserId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, currentUserId: string) => Promise<void>;
  handleIncomingMessage: (payload: NewMessageSocketPayload, currentUserId: string) => void;
  handleIncomingNotification: (payload: NewMessageSocketPayload) => void;
  markConversationRead: (conversationId: string, currentUserId: string) => void;
  clearError: () => void;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: [],
  unreadNotificationCount: 0,
  drawer: {
    isOpen: false,
    conversationId: null,
    projectId: null,
    projectName: null,
    peerName: null,
  },
  loadingConversations: false,
  loadingMessages: false,
  sendingMessage: false,
  error: null,
  dayGroups: [],

  // ── Conversations ──────────────────────────────────────────────────────────

  loadConversations: async () => {
    set({ loadingConversations: true, error: null });
    try {
      const conversations = await chatApi.getConversations();
      set({ conversations, loadingConversations: false });
    } catch (err: any) {
      set({
        loadingConversations: false,
        error: err?.response?.data?.message ?? err?.message ?? 'Error al cargar conversaciones.',
      });
    }
  },

  // ── Drawer control ─────────────────────────────────────────────────────────

  openDrawer: (state) => {
    set({
      drawer: { ...state, isOpen: true },
      messages: [],
      dayGroups: [],
      error: null,
    });
  },

  closeDrawer: () => {
    set({
      drawer: {
        isOpen: false,
        conversationId: null,
        projectId: null,
        projectName: null,
        peerName: null,
      },
    });
  },

  // ── Messages ───────────────────────────────────────────────────────────────

  loadMessages: async (conversationId: string, currentUserId: string) => {
    set({ loadingMessages: true, error: null });
    try {
      const raw = await chatApi.getMessages(conversationId);
      // Inject isMine flag
      const messages: ChatMessage[] = raw.map((m) => ({
        ...m,
        isMine: m.senderId === currentUserId,
      }));
      set({
        messages,
        dayGroups: groupMessagesByDay(messages),
        loadingMessages: false,
      });
    } catch (err: any) {
      const status = err?.response?.status;
      set({
        loadingMessages: false,
        error:
          status === 403
            ? 'No tienes acceso a este chat. Solo pueden participar quienes tienen un contrato o propuesta formal en el proyecto.'
            : err?.response?.data?.message ?? err?.message ?? 'Error al cargar mensajes.',
      });
    }
  },

  sendMessage: async (conversationId: string, content: string, currentUserId: string) => {
    if (!content.trim()) return;
    set({ sendingMessage: true });

    // Optimistic UI: add the message locally immediately
    const optimisticMsg: ChatMessage = {
      id: `opt_${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      senderName: 'Tú',
      senderAvatarUrl: null,
      content: content.trim(),
      isRead: false,
      readAt: null,
      createdAt: new Date().toISOString(),
      isMine: true,
    };

    const prevMessages = get().messages;
    const optimisticList = [...prevMessages, optimisticMsg];
    set({ messages: optimisticList, dayGroups: groupMessagesByDay(optimisticList) });

    try {
      const saved = await chatApi.sendMessage(conversationId, content.trim());
      // Replace the optimistic message with the real persisted one
      const updated = get().messages.map((m) =>
        m.id === optimisticMsg.id ? { ...saved, isMine: true } : m
      );
      set({ messages: updated, dayGroups: groupMessagesByDay(updated), sendingMessage: false });

      // Update conversations list preview
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: saved.content,
                lastMessageTime: saved.createdAt,
                lastMessageIsMine: true,
              }
            : conv
        ),
      }));
    } catch (err: any) {
      // Roll back optimistic update on error
      set({
        messages: prevMessages,
        dayGroups: groupMessagesByDay(prevMessages),
        sendingMessage: false,
        error: err?.response?.data?.message ?? err?.message ?? 'Error al enviar el mensaje.',
      });
    }
  },

  // ── Socket event handlers ──────────────────────────────────────────────────

  handleIncomingMessage: (payload: NewMessageSocketPayload, currentUserId: string) => {
    const convId = payload.conversationId ?? payload.contractId;
    const { drawer, messages } = get();

    // Only append if the drawer is open for this conversation
    if (drawer.isOpen && drawer.conversationId === convId) {
      // Avoid duplicates (optimistic may already exist with a temp id)
      const alreadyExists = messages.some(
        (m) => m.id === payload.id && !m.id.startsWith('opt_')
      );
      if (!alreadyExists) {
        const newMsg: ChatMessage = {
          id: payload.id,
          conversationId: convId,
          senderId: payload.senderId,
          senderName: payload.senderName ?? 'Usuario',
          senderAvatarUrl: payload.senderAvatarUrl ?? null,
          content: payload.content,
          attachmentUrl: payload.attachmentUrl,
          isRead: false,
          readAt: null,
          createdAt: payload.createdAt,
          isMine: payload.senderId === currentUserId,
        };
        // Replace optimistic version if content matches, otherwise append
        const existing = messages.find(
          (m) => m.id.startsWith('opt_') && m.content === payload.content && m.isMine
        );
        const updated = existing
          ? messages.map((m) => (m.id === existing.id ? newMsg : m))
          : [...messages, newMsg];

        set({ messages: updated, dayGroups: groupMessagesByDay(updated) });
      }
    }

    // Always update the conversations sidebar preview
    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (conv.id !== convId) return conv;
        const isMine = payload.senderId === currentUserId;
        return {
          ...conv,
          lastMessage: payload.content,
          lastMessageTime: payload.createdAt,
          lastMessageIsMine: isMine,
          unreadCount: !isMine && (!drawer.isOpen || drawer.conversationId !== convId)
            ? conv.unreadCount + 1
            : conv.unreadCount,
        };
      }),
    }));
  },

  handleIncomingNotification: (payload: NewMessageSocketPayload) => {
    const convId = payload.conversationId ?? payload.contractId;
    const { drawer } = get();
    // Only increment badge if the notification is for a different conversation
    if (!drawer.isOpen || drawer.conversationId !== convId) {
      set((state) => ({ unreadNotificationCount: state.unreadNotificationCount + 1 }));
    }
  },

  markConversationRead: (conversationId: string, currentUserId: string) => {
    // Optimistically mark all received messages as read in state
    const updated = get().messages.map((m) =>
      m.senderId !== currentUserId ? { ...m, isRead: true } : m
    );
    set({
      messages: updated,
      dayGroups: groupMessagesByDay(updated),
      conversations: get().conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
    });
    // Fire-and-forget REST call; ignore errors (not critical)
    chatApi.markAsRead(conversationId).catch(() => null);
  },

  clearError: () => set({ error: null }),
}));
