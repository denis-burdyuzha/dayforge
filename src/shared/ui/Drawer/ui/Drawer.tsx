import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

import styles from "./Drawer.module.scss";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  /** "right" — a side panel (default); "bottom" — a bottom sheet (mobile editing cards) */
  side?: "right" | "bottom";
}

export function Drawer({ open, onClose, children, title, side = "right" }: DrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className={styles.overlay} onMouseDown={onClose}>
      <aside
        className={side === "bottom" ? styles.sheet : styles.drawer}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={styles.header}>
          {title && <h2>{title}</h2>}

          <button type="button" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <div className={styles.content}>{children}</div>
      </aside>
    </div>,
    document.body,
  );
}
