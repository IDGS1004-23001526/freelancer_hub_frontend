/**
 * TypeScript interfaces for the HU-11 Contextual Project Chat module.
 * These match exactly the backend shapes defined in:
 *   - src/routes/chat.routes.ts
 *   - src/infrastructure/realtime/socket.server.ts
 *   - src/application/interfaces/realtime-notifier.interface.ts
 */

/** A single chat conversation between a client and a freelancer, optionally tied to a project */
export interface Conversation {
  id: string;
  projectId: string | null;
  projectName: string;
  peerId: string;
  peerName: string;
  peerRole: string;
  peerAvatarUrl: string | null;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageIsMine: boolean;
  unreadCount: number;
  isOnline: boolean;
}

/** A single chat message within a conversation */
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  content: string;
  attachmentUrl?: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  /** Injected client-side – true when senderId matches the current user's id */
  isMine: boolean;
}

/** Socket payload emitted by the backend as 'new_message' */
export interface NewMessageSocketPayload {
  id: string;
  contractId: string;
  conversationId?: string;
  senderId: string;
  senderRole?: string;
  senderName?: string;
  senderAvatarUrl?: string | null;
  content: string;
  attachmentUrl?: string | null;
  createdAt: string;
}

/** Socket payload emitted by the backend as 'typing' | 'stop_typing' */
export interface TypingSocketPayload {
  contractId: string;
  userId: string;
}

/** Socket payload emitted by the backend as 'message_read' */
export interface MessageReadSocketPayload {
  contractId: string;
  messageId?: string;
  readerId: string;
  readAt: string;
}

/** Payload returned by GET /api/v1/chats/contacts */
export interface ChatContact {
  id: string;
  name: string;
  email: string;
  role: string;
  userRole: 'CLIENT' | 'FREELANCER' | 'ADMIN';
  avatarUrl: string | null;
}

/** Grouped messages by day separator */
export interface DayGroup {
  dateLabel: string;
  messages: ChatMessage[];
}

/** Chat drawer open/close state tied to a specific conversation and project */
export interface ChatDrawerState {
  isOpen: boolean;
  conversationId: string | null;
  projectId: string | null;
  projectName: string | null;
  peerName: string | null;
}
