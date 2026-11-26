import { FunctionsFetchError, FunctionsHttpError } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { mapFunctionError, mapRpcError } from "../api/aiDayReportErrors";
import {
  type DayEvent,
  estimateCharacterXp,
  loadDraft,
  saveDraft,
  toApplyPayload,
  toEditableEvents,
  validateEvent,
} from "./aiDayReport";

const ev = (over: Partial<DayEvent> = {}): DayEvent => ({
  description: "Пробежка",
  hours: 1,
  plannedQuestId: null,
  skill: { kind: "existing", skillId: "s1" },
  confidence: "high",
  note: null,
  ...over,
});

describe("AI day report model", () => {
  it("events of kind none start switched off; XP preview = Σ round(hours·10) of the enabled ones", () => {
    const events = toEditableEvents([
      ev({ hours: 1.5 }),
      ev({ hours: 0.25 }),
      ev({ skill: { kind: "none" }, hours: 2 }),
    ]);
    expect(events.map((e) => e.enabled)).toEqual([true, true, false]);
    expect(estimateCharacterXp(events)).toBe(15 + 3);
  });

  it("validation: hours 0.1–8, a new skill needs a name and 1–2 attributes; switched-off events pass", () => {
    const [ok, tooLong, noName, noAttr, offBad] = toEditableEvents([
      ev(),
      ev({ hours: 9 }),
      ev({ skill: { kind: "new", name: " ", attributes: ["focus"], icon: "misc" } }),
      ev({ skill: { kind: "new", name: "Шахматы", attributes: [], icon: "chess" } }),
      ev({ hours: 0 }),
    ]);
    expect(validateEvent(ok!)).toBeNull();
    expect(validateEvent(tooLong!)).toMatch(/Часы/);
    expect(validateEvent(noName!)).toMatch(/Назови/);
    expect(validateEvent(noAttr!)).toMatch(/1–2/);
    expect(validateEvent({ ...offBad!, enabled: false })).toBeNull();
  });

  it("apply payload: only enabled events, snake_case, trimmed new-skill name", () => {
    const events = toEditableEvents([
      ev({ plannedQuestId: "q1" }),
      ev({
        skill: {
          kind: "new",
          name: " Шахматы ",
          attributes: ["focus", "intelligence"],
          icon: "chess",
        },
      }),
      ev({ skill: { kind: "none" } }),
    ]);
    expect(toApplyPayload(events)).toEqual([
      {
        description: "Пробежка",
        hours: 1,
        planned_quest_id: "q1",
        skill: { kind: "existing", skill_id: "s1" },
      },
      {
        description: "Пробежка",
        hours: 1,
        planned_quest_id: null,
        skill: {
          kind: "new",
          name: "Шахматы",
          attributes: ["focus", "intelligence"],
          icon: "chess",
        },
      },
    ]);
  });

  describe("draft", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("saves and restores per date; empty text removes the draft", () => {
      const store = new Map<string, string>();
      vi.stubGlobal("localStorage", {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
        removeItem: (k: string) => store.delete(k),
      });
      saveDraft("2026-11-20", "пробежал");
      expect(loadDraft("2026-11-20")).toBe("пробежал");
      expect(loadDraft("2026-11-21")).toBe("");
      saveDraft("2026-11-20", "");
      expect(store.size).toBe(0);
    });

    it("does not throw when storage is unavailable", () => {
      vi.stubGlobal("localStorage", {
        getItem: () => {
          throw new Error("denied");
        },
        setItem: () => {
          throw new Error("quota");
        },
        removeItem: () => {
          throw new Error("denied");
        },
      });
      expect(() => saveDraft("2026-11-20", "x")).not.toThrow();
      expect(loadDraft("2026-11-20")).toBe("");
    });
  });
});

describe("error mapping", () => {
  it("Edge Function HTTP error → its code; fetch failure → NETWORK", async () => {
    const response = new Response(
      JSON.stringify({ error: { code: "RATE_LIMIT", message: "Лимит" } }),
      {
        status: 429,
      },
    );
    await expect(mapFunctionError(new FunctionsHttpError(response))).resolves.toMatchObject({
      code: "RATE_LIMIT",
      message: "Лимит",
    });
    await expect(
      mapFunctionError(new FunctionsFetchError(new TypeError("Failed to fetch"))),
    ).resolves.toMatchObject({
      code: "NETWORK",
    });
    const unknown = new Response("<html>bad gateway</html>", { status: 502 });
    await expect(mapFunctionError(new FunctionsHttpError(unknown))).resolves.toMatchObject({
      code: "AI_ERROR",
    });
  });

  it("RPC error → code from message + JSON details; network → NETWORK", () => {
    const limit = mapRpcError({
      message: "DAY_HOURS_LIMIT",
      details: '{"alreadyHours": 7, "newHours": 9.5, "totalHours": 16.5, "limit": 16}',
    });
    expect(limit).toMatchObject({ code: "DAY_HOURS_LIMIT", details: { totalHours: 16.5 } });
    expect(mapRpcError({ message: "TypeError: Failed to fetch" }).code).toBe("NETWORK");
    expect(mapRpcError({ message: "something else" }).code).toBe("UNKNOWN");
  });
});
