import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  clampStart,
  draggedStart,
  nowLineMinutes,
  questErrorMessage,
  snapMinutes,
  tapTime,
  weekDays,
  weekStart,
  weekTitle,
} from "./calendar";
import { layoutTimeline } from "./timelineLayout";

beforeAll(() => {
  vi.stubEnv("TZ", "Europe/Chisinau");
});

describe("calendar model", () => {
  it("weeks run Monday–Sunday", () => {
    expect(weekStart("2026-11-27")).toBe("2026-11-23"); // Friday → Monday
    expect(weekStart("2026-11-29")).toBe("2026-11-23"); // Sunday → the same week
    expect(weekStart("2026-11-30")).toBe("2026-11-30"); // Monday
    expect(weekDays("2026-12-02")).toEqual([
      "2026-11-30",
      "2026-12-01",
      "2026-12-02",
      "2026-12-03",
      "2026-12-04",
      "2026-12-05",
      "2026-12-06",
    ]);
    expect(weekTitle("2026-11-27")).toBe("23–29 нояб.");
    expect(weekTitle("2026-12-02")).toBe("30 нояб. – 6 дек.");
  });

  it("drag snaps to 15 minutes and stays inside the day", () => {
    expect(snapMinutes(607)).toBe(600);
    expect(snapMinutes(608)).toBe(615);
    // 10:00 dragged 40 px down at 2 px/min = +20 min → 10:15 (snapped)
    expect(draggedStart(600, 40, 2, 60)).toBe(615);
    expect(draggedStart(600, -2000, 2, 60)).toBe(0);
    expect(draggedStart(1380, 400, 2, 60)).toBe(1380); // 23:00 + 60 min = end of the day
    expect(clampStart(1430, 30)).toBe(1410);
  });

  it("a tap on the scale gives the time of that place (down to 15 minutes)", () => {
    // range starts 07:00, 1.1 px/min: 100 px ≈ 91 min → 08:30
    expect(tapTime(100, 420, 1.1)).toBe("08:30");
    expect(tapTime(0, 420, 1.1)).toBe("07:00");
  });

  it("the «now» line only on the calendar date of now", () => {
    const now = new Date(2026, 10, 27, 14, 35);
    expect(nowLineMinutes(now, "2026-11-27")).toBe(14 * 60 + 35);
    expect(nowLineMinutes(now, "2026-11-26")).toBeNull();
  });

  it("the range covers 07:00–23:00 or the earliest / latest quest; overlaps get columns", () => {
    const layout = layoutTimeline([
      { id: "a", startTime: "06:15", durationMinutes: 30, hours: null },
      { id: "b", startTime: "06:30", durationMinutes: 60, hours: null },
      { id: "c", startTime: "23:30", durationMinutes: 30, hours: null },
    ]);
    expect(layout.rangeStart).toBe(6 * 60);
    expect(layout.rangeEnd).toBe(24 * 60);
    expect(layout.blocks.find((b) => b.id === "a")).toMatchObject({ column: 0, columns: 2 });
    expect(layout.blocks.find((b) => b.id === "b")).toMatchObject({ column: 1, columns: 2 });
  });

  it("error messages of the quest RPCs", () => {
    expect(questErrorMessage(new Error("QUEST_COMPLETED"))).toMatch(/только название/);
    expect(questErrorMessage(new Error("INVALID_DURATION"))).toMatch(/от 5 до 480/);
    expect(questErrorMessage(new Error("TypeError: Failed to fetch"))).toMatch(/Нет связи/);
    expect(questErrorMessage("x")).toMatch(/Не удалось/);
  });
});
