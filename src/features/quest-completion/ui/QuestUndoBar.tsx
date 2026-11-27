import { useState } from "react";

import { type PendingCompletion, UNDO_WINDOW_MS } from "../model/useDeferredQuestCompletion";
import styles from "./QuestUndoBar.module.scss";

/** the countdown line of one window; remounted (key) for every quest, so it starts where that window stands */
function CountdownLine({ startedAt, windowMs }: { startedAt: number; windowMs: number }) {
  const [elapsed] = useState(() => Date.now() - startedAt);
  return (
    <span
      className={styles.line}
      style={{ animationDuration: `${windowMs}ms`, animationDelay: `-${Math.max(0, elapsed)}ms` }}
      aria-hidden="true"
    />
  );
}

interface QuestUndoBarProps {
  pending: readonly PendingCompletion[];
  onUndoLast: () => void;
  windowMs?: number;
}

/**
 * Bottom bar of the undo window: «Квест выполнен · Отменить» with a 5-second countdown line. With several waiting
 * quests it shows the last one and the count («Выполнено: 3 · Отменить последний»).
 */
export function QuestUndoBar({
  pending,
  onUndoLast,
  windowMs = UNDO_WINDOW_MS,
}: QuestUndoBarProps) {
  const last = pending.at(-1);
  if (!last) return null;
  const many = pending.length > 1;
  return (
    <div className={styles.bar} role="status" aria-live="polite" data-testid="undo-bar">
      <div className={styles.row}>
        <span className={styles.text} data-testid="undo-text">
          {many ? `Выполнено: ${pending.length}` : "Квест выполнен"}
          {!many && <span className={styles.title}> · {last.title}</span>}
        </span>
        <button type="button" className={styles.undo} onClick={onUndoLast} data-testid="undo-btn">
          {many ? "Отменить последний" : "Отменить"}
        </button>
      </div>
      <CountdownLine key={last.id} startedAt={last.startedAt} windowMs={windowMs} />
    </div>
  );
}
