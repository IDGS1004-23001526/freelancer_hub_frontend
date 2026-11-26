import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppNotification, NotificationType } from '../interfaces/notification.interface';

interface NotificationState {
  notifications: AppNotification[];
  isOpen: boolean;
  filter: 'all' | 'unread';
  latestToastNotification: AppNotification | null;

  // Actions
  toggleOpen: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setFilter: (filter: 'all' | 'unread') => void;
  addNotification: (
    notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'> & {
      id?: string;
      createdAt?: string;
      read?: boolean;
    }
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  dismissToast: () => void;
  initDefaultNotifications: (role?: string) => void;
}

const getDefaultMockNotifications = (role?: string): AppNotification[] => {
  const isClient = role === 'CLIENT' || role === 'CLIENTE';
  const now = Date.now();

  if (isClient) {
    return [
      {
        id: 'notif_init_c1',
        title: 'Nueva postulación recibida',
        message: 'Mateo Villalobos se postuló a "E-Commerce en Next.js con Pagos Stripe". Cotización: $4,200 USD.',
        type: 'proposal',
        createdAt: new Date(now - 1000 * 60 * 15).toISOString(), // 15 min ago
        read: false,
        link: '/candidates',
      },
      {
        id: 'notif_init_c2',
        title: 'Depósito en custodia Escrow activado',
        message: 'Los fondos del contrato FL-2026-001 ($4,200 USD) se encuentran retenidos de forma segura.',
        type: 'escrow',
        createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: false,
        link: '/contracts',
      },
      {
        id: 'notif_init_c3',
        title: 'Nuevo entregable de hito para revisión',
        message: 'El freelancer cargó el entregable de arquitectura con archivo PDF y huella SHA-256 validada.',
        type: 'milestone',
        createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        read: true,
        link: '/contracts',
      },
      {
        id: 'notif_init_c4',
        title: 'Bienvenido al Portal de Clientes',
        message: 'Gestiona convocatorias, revisa postulaciones con IA y administra pagos garantizados.',
        type: 'system',
        createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true,
        link: '/dashboard',
      },
    ];
  }

  // Default Freelancer notifications
  return [
    {
      id: 'notif_init_f1',
      title: '¡Felicidades! Fuiste seleccionado',
      message: 'Tu cotización para el proyecto "E-Commerce en Next.js" fue aceptada por el cliente.',
      type: 'proposal',
      createdAt: new Date(now - 1000 * 60 * 20).toISOString(),
      read: false,
      link: '/contracts',
    },
    {
      id: 'notif_init_f2',
      title: 'Hito 1 financiado en Custodia Escrow',
      message: 'El cliente depositó $1,500 USD en custodia. Puedes iniciar el desarrollo con pago garantizado.',
      type: 'escrow',
      createdAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
      read: false,
      link: '/contracts',
    },
    {
      id: 'notif_init_f3',
      title: 'Nuevo mensaje del cliente',
      message: 'El cliente te envió una pregunta en el chat del proyecto: "¿Cuándo podríamos revisar el primer demo?".',
      type: 'message',
      createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
      read: true,
      link: '/messages',
    },
    {
      id: 'notif_init_f4',
      title: 'Billetera digital sincronizada',
      message: 'Tu cuenta bancaria / método de retiro está listo para recibir desembolsos automáticos.',
      type: 'system',
      createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
      read: true,
      link: '/payment-methods',
    },
  ];
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      isOpen: false,
      filter: 'all',
      latestToastNotification: null,

      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
      setIsOpen: (isOpen: boolean) => set({ isOpen }),
      setFilter: (filter: 'all' | 'unread') => set({ filter }),

      addNotification: (incoming) => {
        const id = incoming.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newNotif: AppNotification = {
          id,
          title: incoming.title,
          message: incoming.message,
          type: incoming.type,
          createdAt: incoming.createdAt || new Date().toISOString(),
          read: incoming.read ?? false,
          link: incoming.link,
          metadata: incoming.metadata,
        };

        set((state) => ({
          notifications: [newNotif, ...state.notifications],
          latestToastNotification: newNotif,
        }));
      },

      markAsRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAll: () => {
        set({ notifications: [] });
      },

      dismissToast: () => {
        set({ latestToastNotification: null });
      },

      initDefaultNotifications: (role?: string) => {
        const current = get().notifications;
        if (!current || current.length === 0) {
          set({ notifications: getDefaultMockNotifications(role) });
        }
      },
    }),
    {
      name: 'fh_notifications_v1',
      partialize: (state) => ({
        notifications: state.notifications,
        filter: state.filter,
      }),
    }
  )
);
