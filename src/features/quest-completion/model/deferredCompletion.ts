/**
 * Framework-free core of the undo window: every completion waits `delayMs` (its own timer), then `send` runs once.
 * Undo cancels without any request; `flushAll` sends everything pending at once (hidden tab, pagehide, leaving
 * the page). The UI subscribes through useSyncExternalStore (see useDeferredQuestCompletion).
 */
export interface CompletingQuest {
  id: string;
  title: string;
}

export interface PendingCompletion extends CompletingQuest {
  /** Date.now() when the window opened */
  startedAt: number;
}

export interface CompletionSnapshot {
  /** waiting out the window, in order of marking */
  pending: readonly PendingCompletion[];
  /** shown as completed: waiting or being sent */
  optimisticIds: ReadonlySet<string>;
}

export interface DeferredCompletionController {
  complete(quest: CompletingQuest): void;
  undo(id: string): void;
  undoLast(): void;
  flushAll(): void;
  /** replace the sender (the hook keeps the latest callbacks without recreating the controller) */
  setSend(send: (quest: CompletingQuest) => Promise<void>): void;
  subscribe(listener: () => void): () => void;
  getSnapshot(): CompletionSnapshot;
}

export function createDeferredCompletionController(
  initialSend: (quest: CompletingQuest) => Promise<void>,
  delayMs: number,
): DeferredCompletionController {
  const timers = new Map<
    string,
    { timer: ReturnType<typeof setTimeout>; quest: PendingCompletion }
  >();
  let send = initialSend;
  const sending = new Set<string>();
  const listeners = new Set<() => void>();
  let snapshot: CompletionSnapshot = { pending: [], optimisticIds: new Set() };

  const refresh = () => {
    const pending = [...timers.values()].map((e) => e.quest);
    snapshot = { pending, optimisticIds: new Set([...pending.map((q) => q.id), ...sending]) };
    listeners.forEach((l) => l());
  };

  const fire = (id: string) => {
    const entry = timers.get(id);
    if (!entry) return;
    clearTimeout(entry.timer);
    timers.delete(id);
    sending.add(id);
    refresh();
    void send({ id, title: entry.quest.title }).finally(() => {
      sending.delete(id);
      refresh();
    });
  };

  const undo = (id: string) => {
    const entry = timers.get(id);
    if (!entry) return;
    clearTimeout(entry.timer);
    timers.delete(id);
    refresh();
  };

  return {
    complete(quest) {
      // a second tap opens no second window (also while the request is in flight)
      if (timers.has(quest.id) || sending.has(quest.id)) return;
      const entry: PendingCompletion = { ...quest, startedAt: Date.now() };
      timers.set(quest.id, { timer: setTimeout(() => fire(quest.id), delayMs), quest: entry });
      refresh();
    },
    undo,
    undoLast() {
      const last = [...timers.keys()].at(-1);
      if (last) undo(last);
    },
    flushAll() {
      for (const id of [...timers.keys()]) fire(id);
    },
    setSend(next) {
      send = next;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
  };
}
