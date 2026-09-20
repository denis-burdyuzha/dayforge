import type { ReactNode } from "react";
import { useState } from "react";

import { NotificationContext } from "./context";
import type { Notification, NotificationType } from "./types";

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = (message: string, type: NotificationType = "info") => {
    const id = Date.now();

    setNotifications((current) => [
      ...current,
      {
        id,
        type,
        message,
      },
    ]);

    setTimeout(() => {
      setNotifications((current) => current.filter((notification) => notification.id !== id));
    }, 4000);
  };

  const remove = (id: number) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify, remove }}>
      {children}

      <div id="notifications-root">
        {notifications.map((notification) => (
          <div key={notification.id}>{notification.message}</div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
