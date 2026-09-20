import { useEffect } from "react";

import styles from "./LevelUp.module.scss";

interface LevelUpProps {
  level: number;
  title?: string;
  onComplete?: () => void;
}

const AUTO_DISMISS_MS = 2500;

export function LevelUp({ level, title = "Новый уровень", onComplete }: LevelUpProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-live="assertive"
      onClick={() => onComplete?.()}
    >
      <div className={styles.content}>
        <span className={styles.sparkle}>✦</span>

        <span className={styles.label}>LEVEL UP!</span>

        <span className={styles.level}>{level}</span>

        <span className={styles.title}>{title}</span>

        <span className={styles.sparkle}>✦</span>
      </div>
    </div>
  );
}
