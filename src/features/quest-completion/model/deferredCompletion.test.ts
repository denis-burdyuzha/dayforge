import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createDeferredCompletionController } from "./deferredCompletion";

describe("deferred completion controller (5 s undo window)", () => {
  const sent: string[] = [];
  const send = vi.fn(async (q: { id: string }) => {
    sent.push(q.id);
  });
  const make = () => createDeferredCompletionController(send, 5000);

  beforeEach(() => {
    vi.useFakeTimers();
    sent.length = 0;
    send.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it("shows the quest as completed at once and sends exactly one request after 5 s", async () => {
    const c = make();
    c.complete({ id: "q1", title: "Бег" });
    expect(c.getSnapshot().optimisticIds.has("q1")).toBe(true);
    await vi.advanceTimersByTimeAsync(4999);
    expect(send).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(2);
    expect(sent).toEqual(["q1"]);
    expect(c.getSnapshot().pending).toHaveLength(0);
    expect(c.getSnapshot().optimisticIds.size).toBe(0); // the send finished
  });

  it("a second tap inside the window does not open a second window", async () => {
    const c = make();
    c.complete({ id: "q1", title: "Бег" });
    await vi.advanceTimersByTimeAsync(2000);
    c.complete({ id: "q1", title: "Бег" });
    await vi.advanceTimersByTimeAsync(10_000);
    expect(sent).toEqual(["q1"]);
  });

  it("undo inside the window: no request, not completed", async () => {
    const c = make();
    c.complete({ id: "q1", title: "Бег" });
    await vi.advanceTimersByTimeAsync(3000);
    c.undoLast();
    expect(c.getSnapshot().optimisticIds.has("q1")).toBe(false);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(send).not.toHaveBeenCalled();
  });

  it("several quests: own windows; undoLast cancels the latest only", async () => {
    const c = make();
    c.complete({ id: "a", title: "A" });
    await vi.advanceTimersByTimeAsync(2000);
    c.complete({ id: "b", title: "B" });
    c.complete({ id: "c", title: "C" });
    expect(c.getSnapshot().pending.map((q) => q.id)).toEqual(["a", "b", "c"]);
    c.undoLast(); // C
    await vi.advanceTimersByTimeAsync(3100); // A's window ends first
    expect(sent).toEqual(["a"]);
    await vi.advanceTimersByTimeAsync(2100);
    expect(sent).toEqual(["a", "b"]);
  });

  it("flushAll sends everything pending at once (hidden tab, pagehide, leaving the page)", async () => {
    const c = make();
    c.complete({ id: "a", title: "A" });
    c.complete({ id: "b", title: "B" });
    c.flushAll();
    expect(sent).toEqual(["a", "b"]);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(sent).toEqual(["a", "b"]); // the timers are gone — no second request
  });

  it("the quest stays shown as completed while the request is in flight, then is released", async () => {
    let finish: () => void = () => {};
    const slow = createDeferredCompletionController(
      () => new Promise<void>((resolve) => (finish = resolve)),
      5000,
    );
    slow.complete({ id: "q", title: "Q" });
    await vi.advanceTimersByTimeAsync(5100);
    expect(slow.getSnapshot().optimisticIds.has("q")).toBe(true);
    finish();
    await vi.advanceTimersByTimeAsync(0);
    expect(slow.getSnapshot().optimisticIds.has("q")).toBe(false);
  });

  it("subscribers are notified", () => {
    const c = make();
    const listener = vi.fn();
    const off = c.subscribe(listener);
    c.complete({ id: "q", title: "Q" });
    expect(listener).toHaveBeenCalledTimes(1);
    off();
    c.undo("q");
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
