import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { getLocalDateString } from "./localDate";
import {
  addDays,
  defaultPlanTarget,
  getUserDayDate,
  getUserDayRangeIso,
  isInUserDay,
} from "./userDay";

beforeAll(() => {
  vi.stubEnv("TZ", "Europe/Chisinau");
});

afterEach(() => {
  vi.useRealTimers();
});

/** local time in Europe/Chisinau (UTC+2 in November) */
const at = (iso: string) => new Date(iso);

describe("getUserDayDate (Europe/Chisinau)", () => {
  it("uses the device zone", () => {
    expect(new Date("2026-11-27T12:00:00").getTimezoneOffset()).toBe(-120);
  });

  it("01:30 with a 04:00 boundary → yesterday", () => {
    expect(getUserDayDate(at("2026-11-27T01:30:00"), "04:00")).toBe("2026-11-26");
  });

  it("04:30 with a 04:00 boundary → today; exactly 04:00 → today", () => {
    expect(getUserDayDate(at("2026-11-27T04:30:00"), "04:00")).toBe("2026-11-27");
    expect(getUserDayDate(at("2026-11-27T04:00:00"), "04:00")).toBe("2026-11-27");
  });

  it("a 00:00 boundary behaves like the local date", () => {
    for (const t of ["2026-11-27T00:00:00", "2026-11-27T00:30:00", "2026-11-27T23:59:00"]) {
      expect(getUserDayDate(at(t), "00:00")).toBe(getLocalDateString(at(t)));
    }
  });

  it("crosses month and year boundaries; reads the current time by default", () => {
    expect(getUserDayDate(at("2026-12-01T02:00:00"), "04:00")).toBe("2026-11-30");
    expect(getUserDayDate(at("2027-01-01T03:59:00"), "04:00")).toBe("2026-12-31");
    vi.useFakeTimers();
    vi.setSystemTime(at("2026-11-27T01:30:00"));
    expect(getUserDayDate()).toBe("2026-11-26");
  });

  it("addDays", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("getUserDayRangeIso / isInUserDay", () => {
  it("the day runs from the boundary to the next boundary", () => {
    expect(getUserDayRangeIso("2026-11-26", "04:00")).toEqual({
      start: "2026-11-26T02:00:00.000Z",
      end: "2026-11-27T01:59:59.999Z",
    });
    expect(isInUserDay(at("2026-11-27T01:30:00"), "2026-11-26", "04:00")).toBe(true);
    expect(isInUserDay(at("2026-11-27T04:30:00"), "2026-11-26", "04:00")).toBe(false);
  });
});

describe("defaultPlanTarget", () => {
  it("01:30 with a 04:00 boundary → tomorrow (= the calendar today)", () => {
    const now = at("2026-11-27T01:30:00");
    expect(defaultPlanTarget(now, "04:00")).toBe("tomorrow");
    expect(addDays(getUserDayDate(now, "04:00"), 1)).toBe("2026-11-27");
  });

  it("18:00 → tomorrow, 12:00 → today, a 00:00 boundary at 00:30 → today", () => {
    expect(defaultPlanTarget(at("2026-11-27T18:00:00"), "04:00")).toBe("tomorrow");
    expect(defaultPlanTarget(at("2026-11-27T12:00:00"), "04:00")).toBe("today");
    expect(defaultPlanTarget(at("2026-11-27T00:30:00"), "00:00")).toBe("today");
  });
});
