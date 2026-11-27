import type { ReactNode } from "react";

import styles from "./Toast.module.scss";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose?: () => void;
}

/** One notification; errors are announced at once (alert), the rest politely (status) */
export function Toast({ message, type = "info", onClose }: ToastProps) {
  return (
    <div
      className={`${styles.toast} ${styles[type]}`}
      role={type === "error" ? "alert" : "status"}
      data-testid="toast"
      data-type={type}
    >
      <span className={styles.message}>{message}</span>

      {onClose && (
        <button type="button" onClick={onClose} aria-label="Закрыть" className={styles.close}>
          ×
        </button>
      )}
    </div>
  );
}

/** The fixed place of the toasts: bottom centre, above the bottom navigation and the safe area */
export function ToastViewport({ children }: { children: ReactNode }) {
  return (
    <div className={styles.viewport} aria-live="polite" data-testid="toast-viewport">
      {children}
    </div>
  );
}
