import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
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

/**
 * The part of the screen the on-screen keyboard covers, and the visible height. A bottom sheet lifts above the
 * keyboard (iOS does not resize the layout viewport) and is never taller than 90 % of what is visible.
 */
function useVisualViewport(active: boolean): { keyboard: number; height: number } | null {
  const [state, setState] = useState<{ keyboard: number; height: number } | null>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!active || !vv) return;
    const update = () =>
      setState({
        keyboard: Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)),
        height: vv.height,
      });
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [active]);
  return active ? state : null;
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

  const viewport = useVisualViewport(open && side === "bottom");

  if (!open) {
    return null;
  }

  const sheetStyle: CSSProperties | undefined =
    side === "bottom" && viewport
      ? { bottom: viewport.keyboard, maxHeight: `${Math.round(viewport.height * 0.9)}px` }
      : undefined;

  return createPortal(
    <div className={styles.overlay} onMouseDown={onClose}>
      <aside
        className={side === "bottom" ? styles.sheet : styles.drawer}
        style={sheetStyle}
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
