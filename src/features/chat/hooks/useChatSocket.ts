import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  NewMessageSocketPayload,
  TypingSocketPayload,
} from '../../../interfaces/chat.interface';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:4000';

const RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY_MS = 2000;

interface UseChatSocketOptions {
  token: string | null;
  conversationId: string | null;
  onNewMessage: (payload: NewMessageSocketPayload) => void;
  onTypingChange: (isTyping: boolean) => void;
  onMessagesRead?: (conversationId: string) => void;
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
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['polling', 'websocket'],
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
      activeRoomRef.current = null;
      if (reason === 'io server disconnect') {
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

    return () => {
      socket.removeAllListeners();
      if (socket.connected) {
        socket.disconnect();
      } else {
        socket.close();
      }
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token]);

  // ── Room join / leave (solo cuando el socket ya está conectado) ────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isConnected || !conversationId) return;

    if (activeRoomRef.current && activeRoomRef.current !== conversationId) {
      socket.emit('leave_contract', { conversationId: activeRoomRef.current });
    }

    socket.emit(
      'join_conversation',
      { conversationId },
      (ack?: { ok: boolean; room?: string; error?: string }) => {
        if (ack && !ack.ok) {
          setConnectionError(ack.error ?? 'No se pudo unir a la sala de chat.');
        }
      }
    );
    activeRoomRef.current = conversationId;

    return () => {
      if (socket.connected && activeRoomRef.current) {
        socket.emit('leave_contract', { conversationId: activeRoomRef.current });
        activeRoomRef.current = null;
      }
    };
  }, [conversationId, isConnected]);

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