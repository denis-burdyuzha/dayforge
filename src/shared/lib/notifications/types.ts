export type NotificationType = "success" | "error" | "info";

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

export interface NotificationContextValue {
  /** shows a toast; it hides itself after `durationMs` (default 2.5 s, errors 4 s) */
  notify: (message: string, type?: NotificationType, durationMs?: number) => void;
  remove: (id: number) => void;
}
