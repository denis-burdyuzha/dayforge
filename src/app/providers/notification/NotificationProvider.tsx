import type { ReactNode } from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import { NotificationContext } from "@/shared/lib/notifications/context";
import type { Notification, NotificationType } from "@/shared/lib/notifications/types";
import { Toast, ToastViewport } from "@/shared/ui/Toast/ui/Toast";

interface NotificationProviderProps {
  children: ReactNode;
}

/** Renders the app's toasts (shared/ui/Toast) in one fixed viewport; `notify` comes from useNotifications() */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const nextId = useRef(0);

  const remove = useCallback((id: number) => {
    setNotifications((current) => current.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, type: NotificationType = "info", durationMs?: number) => {
      nextId.current += 1;
      const id = nextId.current;
      setNotifications((current) => [...current, { id, type, message }]);
      window.setTimeout(() => remove(id), durationMs ?? (type === "error" ? 4000 : 2500));
    },
    [remove],
  );

  const value = useMemo(() => ({ notify, remove }), [notify, remove]);

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <ToastViewport>
        {notifications.map((n) => (
          <Toast key={n.id} message={n.message} type={n.type} onClose={() => remove(n.id)} />
        ))}
      </ToastViewport>
    </NotificationContext.Provider>
  );
}
