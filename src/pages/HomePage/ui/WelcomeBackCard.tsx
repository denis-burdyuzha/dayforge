import { X } from "lucide-react";
import { useState } from "react";

import styles from "../HomePage.module.scss";

const KEY_PREFIX = "dayforge:welcome-back:";

function wasDismissed(brokenOn: string): boolean {
  try {
    return localStorage.getItem(KEY_PREFIX + brokenOn) === "1";
  } catch {
    return false;
  }
}

/** «С возвращением!» after a recent break — once per break (the key is the break date) */
export function WelcomeBackCard({ brokenOn }: { brokenOn: string }) {
  const [hidden, setHidden] = useState(() => wasDismissed(brokenOn));
  if (hidden) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY_PREFIX + brokenOn, "1");
    } catch {
      // private mode: the card just hides for this visit
    }
    setHidden(true);
  }

  return (
    <aside className={styles.welcomeBack} data-testid="welcome-back">
      <div>
        <p className={styles.welcomeBackTitle}>С возвращением!</p>
        <p className={styles.welcomeBackText}>
          Новая серия начинается сегодня. Твой прогресс никуда не делся.
        </p>
      </div>
      <button
        type="button"
        className={styles.welcomeBackClose}
        onClick={dismiss}
        aria-label="Закрыть"
        data-testid="welcome-back-close"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </aside>
  );
}
