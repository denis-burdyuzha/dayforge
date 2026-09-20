import styles from "./Toast.module.scss";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  title: string;
  message: string;
  type?: ToastType;
  onClose?: () => void;
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span>{message}</span>

      {onClose && (
        <button type="button" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
      )}
    </div>
  );
}
