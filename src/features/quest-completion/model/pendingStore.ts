/**
 * Completions waiting out the undo window, mirrored to localStorage (`pendingQuestCompletions`) so that a
 * completion is not lost when the tab is closed or killed before complete_quest went out. Added when a window
 * opens; removed on undo, on any answer of the server, and on errors that are final. On the next app start the
 * ones older than the window are sent again (complete_quest is idempotent: a completed quest awards nothing).
 * Storage may be unavailable (private mode) — then nothing is persisted.
 */
export const PENDING_KEY = "pendingQuestCompletions";

export interface StoredCompletion {
  id: string;
  title: string;
  /** Date.now() when the quest was marked */
  at: number;
}

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const browserStorage = (): KeyValueStorage | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export function readPending(
  storage: KeyValueStorage | null = browserStorage(),
): StoredCompletion[] {
  if (!storage) return [];
  try {
    const raw: unknown = JSON.parse(storage.getItem(PENDING_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (e): e is StoredCompletion =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as StoredCompletion).id === "string" &&
        typeof (e as StoredCompletion).at === "number",
    );
  } catch {
    return [];
  }
}

function write(entries: StoredCompletion[], storage: KeyValueStorage | null) {
  if (!storage) return;
  try {
    storage.setItem(PENDING_KEY, JSON.stringify(entries));
  } catch {
    /* quota / private mode: the in-memory window still works */
  }
}

export function addPending(
  entry: StoredCompletion,
  storage: KeyValueStorage | null = browserStorage(),
) {
  const rest = readPending(storage).filter((e) => e.id !== entry.id);
  write([...rest, entry], storage);
}

export function removePending(id: string, storage: KeyValueStorage | null = browserStorage()) {
  const all = readPending(storage);
  const rest = all.filter((e) => e.id !== id);
  if (rest.length !== all.length) write(rest, storage);
}

/** a request that never got a server answer (offline, aborted on page close) — worth sending again later */
export function isNetworkError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /Failed to fetch|NetworkError|Load failed|network|aborted|ERR_/i.test(message);
}

/**
 * Sends the stored completions older than `windowMs` again and forgets them on any server answer (also «already
 * completed» and other final errors); network errors keep them for the next start. Returns the ids that got an
 * answer.
 */
export async function resendStalePending(
  send: (id: string) => Promise<unknown>,
  options: { now?: number; windowMs?: number; storage?: KeyValueStorage | null } = {},
): Promise<string[]> {
  const storage = options.storage === undefined ? browserStorage() : options.storage;
  const now = options.now ?? Date.now();
  const windowMs = options.windowMs ?? 5000;
  const stale = readPending(storage).filter((e) => now - e.at > windowMs);
  const answered: string[] = [];
  for (const entry of stale) {
    try {
      await send(entry.id);
      removePending(entry.id, storage);
      answered.push(entry.id);
    } catch (err) {
      if (!isNetworkError(err)) {
        removePending(entry.id, storage); // final: not found / not yours / already completed
        answered.push(entry.id);
      }
    }
  }
  return answered;
}
