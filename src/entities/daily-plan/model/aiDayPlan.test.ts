import { FunctionsHttpError } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { mapPlanFunctionError, mapPlanRpcError } from "../api/aiDayPlanErrors";
import {
  findOverlaps,
  formatDuration,
  type PlanItem,
  sortByTime,
  toApplyPayload,
  toEditableItems,
  totalMinutes,
  validateItem,
} from "./aiDayPlan";
import { layoutTimeline } from "./timelineLayout";

const item = (over: Partial<PlanItem> = {}): PlanItem => ({
  title: "Английский",
  date: "2026-11-27",
  startTime: "10:00",
  durationMinutes: 60,
  skill: { kind: "existing", skillId: "s1" },
  duplicateOfExisting: false,
  confidence: "high",
  note: null,
  ...over,
});

describe("AI day plan model — two dates", () => {
  it("preview sorted by date then time; payload carries the date; overlaps only within a date", () => {
    const items = toEditableItems([
      item({ title: "Завтра утро", date: "2026-11-28", startTime: "08:00" }),
      item({ title: "Сегодня вечер", startTime: "20:00" }),
      item({ title: "Сегодня утро", startTime: "08:00" }),
    ]);
    expect(items.map((i) => i.title)).toEqual(["Сегодня утро", "Сегодня вечер", "Завтра утро"]);
    expect(toApplyPayload(items).map((p) => p.date)).toEqual([
      "2026-11-27",
      "2026-11-27",
      "2026-11-28",
    ]);
    const overlaps = findOverlaps(
      items.map((i) => ({ ...i, key: i.key })),
      [{ key: "q", title: "Квест", date: "2026-11-28", startTime: "08:30", durationMinutes: 30 }],
    );
    expect(overlaps.get(items[0]!.key)).toBeUndefined(); // 08:00 today vs 08:00 tomorrow
    expect(overlaps.get(items[2]!.key)).toEqual(["Квест"]);
  });
});

describe("AI day plan model", () => {
  it("preview: sorted by time (untimed last, order kept); duplicates start switched off", () => {
    const items = toEditableItems([
      item({ title: "Б", startTime: null }),
      item({ title: "Вечер", startTime: "19:00" }),
      item({ title: "А", startTime: null }),
      item({ title: "Утро", startTime: "07:30", duplicateOfExisting: true }),
    ]);
    expect(items.map((i) => i.title)).toEqual(["Утро", "Вечер", "Б", "А"]);
    expect(items.map((i) => i.enabled)).toEqual([false, true, true, true]);
    expect(totalMinutes(items)).toBe(180);
    expect(sortByTime([{ startTime: "09:00" }, { startTime: "08:59" }])[0]!.startTime).toBe(
      "08:59",
    );
  });

  it("validation: title, duration 5–480 step 5, HH:MM, new skill name + 1–2 attributes; off items pass", () => {
    const [ok, noTitle, short, odd, badTime, noName, noAttrs, off] = [
      item(),
      item({ title: " " }),
      item({ durationMinutes: 0 }),
      item({ durationMinutes: 47 }),
      item({ startTime: "25:00" }),
      item({ skill: { kind: "new", name: "", attributes: ["focus"], icon: "misc" } }),
      item({ skill: { kind: "new", name: "Шахматы", attributes: [], icon: "chess" } }),
      item({ durationMinutes: 999 }),
    ].map((it, i) => ({ ...it, key: `k${i}`, enabled: i < 7 }));
    expect(validateItem(ok!)).toBeNull();
    expect(validateItem(noTitle!)).toMatch(/Назови пункт/);
    expect(validateItem(short!)).toMatch(/Длительность/);
    expect(validateItem(odd!)).toMatch(/шаг 5/);
    expect(validateItem(badTime!)).toMatch(/ЧЧ:ММ/);
    expect(validateItem(noName!)).toMatch(/Назови новый навык/);
    expect(validateItem(noAttrs!)).toMatch(/1–2/);
    expect(validateItem(off!)).toBeNull();
  });

  it("apply payload: enabled items only, snake_case, trimmed names", () => {
    const items = toEditableItems([
      item({ title: " Урок ", startTime: "10:00" }),
      item({
        title: "Шахматы",
        startTime: null,
        durationMinutes: 45,
        skill: { kind: "new", name: " Шахматы ", attributes: ["intelligence"], icon: "chess" },
      }),
      item({ title: "Дубль", duplicateOfExisting: true, skill: { kind: "none" } }),
    ]);
    expect(toApplyPayload(items)).toEqual([
      {
        title: "Урок",
        date: "2026-11-27",
        start_time: "10:00",
        duration_minutes: 60,
        skill: { kind: "existing", skill_id: "s1" },
      },
      {
        title: "Шахматы",
        date: "2026-11-27",
        start_time: null,
        duration_minutes: 45,
        skill: { kind: "new", name: "Шахматы", attributes: ["intelligence"], icon: "chess" },
      },
    ]);
  });

  it("overlaps: with other items and with quests on the plan; touching is not an overlap", () => {
    const overlaps = findOverlaps(
      [
        { key: "a", title: "Код", startTime: "10:00", durationMinutes: 120 },
        { key: "b", title: "Созвон", startTime: "11:00", durationMinutes: 30 },
        { key: "c", title: "Обед", startTime: "12:00", durationMinutes: 60 },
        { key: "d", title: "Звонок", startTime: null, durationMinutes: 15 },
      ],
      [{ key: "q1", title: "Пробежка", startTime: "12:30", durationMinutes: 30 }],
    );
    expect(overlaps.get("a")).toEqual(["Созвон"]);
    expect(overlaps.get("b")).toEqual(["Код"]);
    expect(overlaps.get("c")).toEqual(["Пробежка"]);
    expect(overlaps.has("d")).toBe(false);
  });

  it("formatDuration", () => {
    expect(formatDuration(90)).toBe("1 ч 30 мин");
    expect(formatDuration(120)).toBe("2 ч");
    expect(formatDuration(45)).toBe("45 мин");
  });
});

describe("timeline layout", () => {
  it("range at least 07:00–23:00, widened to whole hours around early / late quests", () => {
    expect(layoutTimeline([])).toMatchObject({ rangeStart: 420, rangeEnd: 1380 });
    const l = layoutTimeline([
      { id: "a", startTime: "06:15", durationMinutes: 30, hours: null },
      { id: "b", startTime: "23:10", durationMinutes: 40, hours: null },
    ]);
    expect([l.rangeStart, l.rangeEnd]).toEqual([360, 1440]);
    expect(l.hours[0]).toBe(360);
    expect(l.hours.at(-1)).toBe(1440);
  });

  it("overlapping quests side by side in two columns; the rest full width; untimed listed", () => {
    const l = layoutTimeline([
      { id: "code", startTime: "10:00", durationMinutes: 120, hours: null },
      { id: "call", startTime: "11:00", durationMinutes: 30, hours: null },
      { id: "lunch", startTime: "12:00", durationMinutes: null, hours: 1 },
      { id: "late", startTime: "11:30", durationMinutes: 15, hours: null },
      { id: "errand", startTime: null, durationMinutes: 20, hours: null },
    ]);
    const byId = Object.fromEntries(l.blocks.map((b) => [b.id, b]));
    expect(byId.code).toMatchObject({ column: 0, columns: 2, start: 600, end: 720 });
    expect(byId.call).toMatchObject({ column: 1, columns: 2 });
    expect(byId.late).toMatchObject({ column: 1, columns: 2 });
    expect(byId.lunch).toMatchObject({ column: 0, columns: 1, end: 780 });
    expect(l.untimed).toEqual(["errand"]);
  });
});

describe("plan error mapping", () => {
  it("Edge Function code; RPC PLAN_HOURS_LIMIT with details", async () => {
    const res = new Response(JSON.stringify({ error: { code: "RATE_LIMIT", message: "Лимит" } }), {
      status: 429,
    });
    await expect(mapPlanFunctionError(new FunctionsHttpError(res))).resolves.toMatchObject({
      code: "RATE_LIMIT",
    });
    const e = mapPlanRpcError({
      message: "PLAN_HOURS_LIMIT",
      details: '{"existingMinutes": 60, "newMinutes": 960, "totalMinutes": 1020, "limit": 960}',
    });
    expect(e).toMatchObject({ code: "PLAN_HOURS_LIMIT", details: { totalMinutes: 1020 } });
    expect(mapPlanRpcError({ message: "Failed to fetch" }).code).toBe("NETWORK");
  });
});
