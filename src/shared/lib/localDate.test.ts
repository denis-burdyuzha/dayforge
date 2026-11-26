import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { getLocalDateString, getLocalDayRangeIso, parseLocalDate } from "./localDate";

// Europe/Chisinau is UTC+2 in November: local midnight–02:00 is still «yesterday» in UTC.
// vi.stubEnv sets process.env.TZ, which Node applies to Date at once.
beforeAll(() => {
  vi.stubEnv("TZ", "Europe/Chisinau");
});

afterAll(() => {
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getLocalDateString (TZ Europe/Chisinau)", () => {
  it("the zone is really applied in this process", () => {
    expect(new Date("2026-11-26T12:00:00Z").getTimezoneOffset()).toBe(-120);
  });

  it("00:30 local → today's local date, not yesterday (UTC still shows yesterday)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-25T22:30:00Z")); // 26.11 00:30 local
    expect(new Date().toISOString().slice(0, 10)).toBe("2026-11-25"); // the old bug
    expect(getLocalDateString()).toBe("2026-11-26");
  });

  it("23:30 local → today's local date, not tomorrow", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-26T21:30:00Z")); // 26.11 23:30 local
    expect(getLocalDateString()).toBe("2026-11-26");
  });

  it("an explicit date is formatted in local time with zero padding", () => {
    expect(getLocalDateString(new Date(2026, 0, 5, 0, 10))).toBe("2026-01-05");
  });

  it("parseLocalDate gives local midnight; the day range covers the local day in UTC", () => {
    const d = parseLocalDate("2026-11-26");
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 10, 26, 0]);
    expect(getLocalDayRangeIso("2026-11-26")).toEqual({
      start: "2026-11-25T22:00:00.000Z",
      end: "2026-11-26T21:59:59.999Z",
    });
  });
});
