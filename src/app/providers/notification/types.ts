export type NotificationType = "success" | "error" | "info";

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

export interface NotificationContextValue {
  notify: (message: string, type?: NotificationType) => void;
  remove: (id: number) => void;
}
