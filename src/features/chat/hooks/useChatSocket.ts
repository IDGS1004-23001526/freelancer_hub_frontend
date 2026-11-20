/**
 * useChatSocket – React hook that manages a persistent Socket.io connection
 * for the HU-11 Contextual Chat module.
 *
 * Socket.io events (backend → frontend):
 *   'new_message'              – A new message has been broadcast to the room
 *   'new_message_notification' – A message arrived for the user (they may not be in the room)
 *   'typing'                   – The peer started typing
 *   'stop_typing'              – The peer stopped typing
 *   'message_read'             – Messages were marked as read by the peer
 *   'socket_error'             – Server-side auth or room error
 *
 * Client → Server events:
 *   'join_conversation'        – Join the WebSocket room for a conversation
 *   'leave_contract'           – Leave a room on unmount / conversation switch
 *   'send_message'             – Send a message via socket (optional; we use REST+socket combo)
 *   'typing'                   – Notify peer that this user is typing
 *   'stop_typing'              – Notify peer that this user stopped typing
 *   'mark_as_read'             – Notify room that messages have been read
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  NewMessageSocketPayload,
  TypingSocketPayload,
} from '../../../interfaces/chat.interface';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:4000';

/** Reconnection limits to avoid infinite retry spam when server is down */
const RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY_MS = 2000;

interface UseChatSocketOptions {
  /** JWT access token – required for the socket handshake middleware */
  token: string | null;
  /** ID of the conversation / room to join automatically on connect */
  conversationId: string | null;
  /** Called when a new message arrives for the active room */
  onNewMessage: (payload: NewMessageSocketPayload) => void;
  /** Called when the peer starts or stops typing */
  onTypingChange: (isTyping: boolean) => void;
  /** Called when messages are marked as read by the peer */
  onMessagesRead?: (conversationId: string) => void;
  /** Called when a notification message arrives (user not in room) */
  onNotification?: (payload: NewMessageSocketPayload) => void;
}

interface UseChatSocketReturn {
  isConnected: boolean;
  connectionError: string | null;
  sendTyping: (conversationId: string) => void;
  sendStopTyping: (conversationId: string) => void;
  emitMarkAsRead: (conversationId: string, messageId?: string) => void;
}

export function useChatSocket({
  token,
  conversationId,
  onNewMessage,
  onTypingChange,
  onMessagesRead,
  onNotification,
}: UseChatSocketOptions): UseChatSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const activeRoomRef = useRef<string | null>(null);

  // Keep callback refs stable so we don't re-trigger the main effect
  const onNewMessageRef = useRef(onNewMessage);
  const onTypingChangeRef = useRef(onTypingChange);
  const onMessagesReadRef = useRef(onMessagesRead);
  const onNotificationRef = useRef(onNotification);

  useEffect(() => { onNewMessageRef.current = onNewMessage; }, [onNewMessage]);
  useEffect(() => { onTypingChangeRef.current = onTypingChange; }, [onTypingChange]);
  useEffect(() => { onMessagesReadRef.current = onMessagesRead; }, [onMessagesRead]);
  useEffect(() => { onNotificationRef.current = onNotification; }, [onNotification]);

  // ── Main socket lifecycle ──────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      // No token → don't create a socket; silently skip
      return;
    }

    // Reuse existing socket if already connected to the same server
    if (!socketRef.current) {
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: RECONNECTION_ATTEMPTS,
        reconnectionDelay: RECONNECTION_DELAY_MS,
        autoConnect: true,
      });

      socket.on('connect', () => {
        setIsConnected(true);
        setConnectionError(null);
      });

      socket.on('disconnect', (reason) => {
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          // The server forcibly disconnected us (e.g. token expired)
          setConnectionError('Sesión de chat cerrada por el servidor. Recarga la página.');
        }
      });

      socket.on('connect_error', (err) => {
        setIsConnected(false);
        setConnectionError(err.message ?? 'No se pudo conectar al servidor de chat.');
      });

      socket.on('socket_error', (data: { contractId?: string; message?: string }) => {
        setConnectionError(data?.message ?? 'Error en el servidor de chat.');
      });

      // Incoming events
      socket.on('new_message', (payload: NewMessageSocketPayload) => {
        onNewMessageRef.current(payload);
      });

      socket.on('new_message_notification', (payload: NewMessageSocketPayload) => {
        onNotificationRef.current?.(payload);
      });

      socket.on('typing', (_payload: TypingSocketPayload) => {
        onTypingChangeRef.current(true);
      });

      socket.on('stop_typing', (_payload: TypingSocketPayload) => {
        onTypingChangeRef.current(false);
      });

      socket.on('message_read', (data: { contractId: string }) => {
        onMessagesReadRef.current?.(data.contractId);
      });

      socketRef.current = socket;
    }

    return () => {
      // We intentionally do NOT destroy the socket here so it persists while
      // the user switches between conversations within the same session.
      // The socket is closed in the second effect below when the component unmounts.
    };
  }, [token]); // only re-create when the token changes

  // ── Room join / leave ──────────────────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !conversationId) return;

    // Leave the previous room if switching conversations
    if (activeRoomRef.current && activeRoomRef.current !== conversationId) {
      socket.emit('leave_contract', { conversationId: activeRoomRef.current });
    }

    // Join the new room (backend validates participant rights)
    socket.emit(
      'join_conversation',
      { conversationId },
      (ack: { ok: boolean; room?: string; error?: string }) => {
        if (!ack.ok) {
          setConnectionError(ack.error ?? 'No se pudo unir a la sala de chat.');
        }
      }
    );
    activeRoomRef.current = conversationId;

    return () => {
      // Leave room when conversationId changes or component unmounts
      if (activeRoomRef.current) {
        socket.emit('leave_contract', { conversationId: activeRoomRef.current });
        activeRoomRef.current = null;
      }
    };
  }, [conversationId]);

  // ── Cleanup on full unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  // ── Outbound helpers ───────────────────────────────────────────────────────
  const sendTyping = useCallback((convId: string) => {
    socketRef.current?.emit('typing', { conversationId: convId });
  }, []);

  const sendStopTyping = useCallback((convId: string) => {
    socketRef.current?.emit('stop_typing', { conversationId: convId });
  }, []);

  const emitMarkAsRead = useCallback((convId: string, messageId?: string) => {
    socketRef.current?.emit('mark_as_read', { conversationId: convId, messageId });
  }, []);

  return { isConnected, connectionError, sendTyping, sendStopTyping, emitMarkAsRead };
}
