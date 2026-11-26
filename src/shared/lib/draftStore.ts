/**
 * A text draft per date in localStorage (AI report, AI plan). Storage may be unavailable (private mode,
 * quota, blocked site data) — then the draft lives only in memory and nothing throws.
 */
export interface DraftStore {
  load(date: string): string;
  save(date: string, text: string): void;
  clear(date: string): void;
}

export function createDraftStore(prefix: string): DraftStore {
  const key = (date: string) => `${prefix}${date}`;
  const save = (date: string, text: string) => {
    try {
      if (text) localStorage.setItem(key(date), text);
      else localStorage.removeItem(key(date));
    } catch {
      // storage unavailable: the draft lives only in memory
    }
  };
  return {
    load(date) {
      try {
        return localStorage.getItem(key(date)) ?? "";
      } catch {
        return "";
      }
    },
    save,
    clear: (date) => save(date, ""),
  };
}
