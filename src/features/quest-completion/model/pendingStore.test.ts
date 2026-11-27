import { describe, expect, it, vi } from "vitest";

import {
  addPending,
  isNetworkError,
  type KeyValueStorage,
  PENDING_KEY,
  readPending,
  removePending,
  resendStalePending,
} from "./pendingStore";

const memory = (): KeyValueStorage & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
  };
};

describe("pending completions in storage", () => {
  it("add / remove by quest id, under pendingQuestCompletions", () => {
    const s = memory();
    addPending({ id: "a", title: "A", at: 1 }, s);
    addPending({ id: "b", title: "B", at: 2 }, s);
    addPending({ id: "a", title: "A", at: 3 }, s); // the same quest again replaces it
    expect(readPending(s).map((e) => [e.id, e.at])).toEqual([
      ["b", 2],
      ["a", 3],
    ]);
    removePending("b", s);
    expect(readPending(s).map((e) => e.id)).toEqual(["a"]);
    expect(JSON.parse(s.data.get(PENDING_KEY)!)).toEqual([{ id: "a", title: "A", at: 3 }]);
  });

  it("garbage or no storage → empty, nothing throws", () => {
    const s = memory();
    s.data.set(PENDING_KEY, "{not json");
    expect(readPending(s)).toEqual([]);
    s.data.set(PENDING_KEY, JSON.stringify([{ id: 1 }, { id: "ok", title: "x", at: 5 }]));
    expect(readPending(s).map((e) => e.id)).toEqual(["ok"]);
    expect(readPending(null)).toEqual([]);
    expect(() => addPending({ id: "x", title: "x", at: 1 }, null)).not.toThrow();
  });

  it("network errors are told apart from server answers", () => {
    expect(isNetworkError(new TypeError("Failed to fetch"))).toBe(true);
    expect(isNetworkError(new Error("TypeError: Load failed"))).toBe(true);
    expect(isNetworkError(new Error("Quest not found"))).toBe(false);
    expect(isNetworkError(new Error("Quest does not belong to user character"))).toBe(false);
  });
});

describe("resend on the next start", () => {
  it("sends only the ones older than the window and forgets them on an answer", async () => {
    const s = memory();
    addPending({ id: "old", title: "O", at: 1_000 }, s);
    addPending({ id: "fresh", title: "F", at: 9_000 }, s); // a window of another tab may still be open
    const send = vi.fn(async (_id: string) => ({ xpAwarded: 10 }));
    const answered = await resendStalePending(send, { now: 10_000, windowMs: 5000, storage: s });
    expect(send.mock.calls.map((c) => c[0])).toEqual(["old"]);
    expect(answered).toEqual(["old"]);
    expect(readPending(s).map((e) => e.id)).toEqual(["fresh"]);
  });

  it("«already completed» (a normal answer) and final server errors forget the entry; network errors keep it", async () => {
    const s = memory();
    addPending({ id: "done", title: "D", at: 0 }, s);
    addPending({ id: "gone", title: "G", at: 0 }, s);
    addPending({ id: "offline", title: "O", at: 0 }, s);
    const send = vi.fn(async (id: string) => {
      if (id === "done") return { xpAwarded: 0 }; // complete_quest: success false «Quest already completed»
      if (id === "gone") throw new Error("Quest not found");
      throw new TypeError("Failed to fetch");
    });
    const answered = await resendStalePending(send, { now: 60_000, storage: s });
    expect(answered.sort()).toEqual(["done", "gone"]);
    expect(readPending(s).map((e) => e.id)).toEqual(["offline"]);
  });
});
