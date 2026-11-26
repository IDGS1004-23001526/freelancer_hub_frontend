import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../../stores/auth.store';
import { useNotificationStore } from '../../../stores/notification.store';
import { useChatStore } from '../../../stores/chat.store';
import type { NewMessageSocketPayload } from '../../../interfaces/chat.interface';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

export function useNotificationListener() {
  const { accessToken, user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const { addNotification, initDefaultNotifications } = useNotificationStore();
  const { handleIncomingNotification } = useChatStore();

  // Inicializar notificaciones mock según el rol si está vacío
  useEffect(() => {
    initDefaultNotifications(user?.role);
  }, [user?.role, initDefaultNotifications]);

  useEffect(() => {
    const token = accessToken || localStorage.getItem('fh_access_token');
    // Si no hay token o es un token de entorno de pruebas mock E2E, no inicializar conexión de socket
    if (!token || token.includes('test_') || token.includes('mock_')) return;

    let socket: Socket | null = null;
    try {
      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnectionAttempts: 3,
        reconnectionDelay: 5000,
        timeout: 4000,
        autoConnect: true,
      });

      // 1. Mensaje de chat nuevo
      socket.on('new_message_notification', (payload: NewMessageSocketPayload) => {
        handleIncomingNotification(payload);
        addNotification({
          type: 'message',
          title: `Nuevo mensaje de ${payload.senderName || 'Colaborador'}`,
          message: payload.content || 'Has recibido un nuevo mensaje en la plataforma.',
          link: payload.conversationId ? `/messages/${payload.conversationId}` : '/messages',
          metadata: payload,
        });
      });

      // 2. Entregable de hito presentado
      socket.on('milestone_submitted', (payload: { title?: string; contractId?: string }) => {
        addNotification({
          type: 'milestone',
          title: 'Entregable enviado a revisión',
          message: payload.title
            ? `Se subió el entregable para "${payload.title}".`
            : 'Se ha presentado un nuevo entregable de hito para revisión.',
          link: payload.contractId ? `/contracts/${payload.contractId}` : '/contracts',
          metadata: payload,
        });
      });

      // 3. Hito aprobado y fondos liberados
      socket.on('milestone_approved', (payload: { title?: string; contractId?: string }) => {
        addNotification({
          type: 'milestone',
          title: 'Hito aprobado exitosamente',
          message: payload.title
            ? `El hito "${payload.title}" fue aprobado y los fondos liberados.`
            : 'El hito fue aprobado satisfactoriamente.',
          link: payload.contractId ? `/contracts/${payload.contractId}` : '/contracts',
          metadata: payload,
        });
      });

      // 4. Cambio de estado de contrato
      socket.on('contract_status_changed', (payload: { newStatus?: string; contractId?: string }) => {
        addNotification({
          type: 'contract',
          title: 'Estado del contrato actualizado',
          message: `El contrato ahora se encuentra en estado: ${payload.newStatus || 'Actualizado'}.`,
          link: payload.contractId ? `/contracts/${payload.contractId}` : '/contracts',
          metadata: payload,
        });
      });

      socketRef.current = socket;
    } catch {
      // Ignorar fallas de socket
    }

    return () => {
      if (socket) {
        socket.removeAllListeners();
        if (socket.connected) {
          socket.disconnect();
        } else {
          socket.close();
        }
      }
      socketRef.current = null;
    };
  }, [accessToken, addNotification, handleIncomingNotification]);
}
