export type NotificationType =
  | 'message'
  | 'milestone'
  | 'contract'
  | 'escrow'
  | 'proposal'
  | 'system';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string; // ISO 8601 string
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
}
