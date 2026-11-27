/** The client rule (getUserDayDate) and the Edge Function copy (_shared/ai/userDay.ts) agree on the same inputs. */
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  addDaysIso,
  isBefore,
  localDateTime,
  userDayDate,
} from "../../../supabase/functions/_shared/ai/userDay";
import { getLocalDateString } from "./localDate";
import { addDays, getUserDayDate } from "./userDay";

beforeAll(() => {
  vi.stubEnv("TZ", "Europe/Chisinau");
});

describe("client vs server user day", () => {
  it("same date for every half hour of a day and every boundary", () => {
    for (const boundary of ["00:00", "00:30", "02:00", "04:00", "06:00"]) {
      for (let m = 0; m < 24 * 60; m += 30) {
        const now = new Date(2026, 10, 27, Math.floor(m / 60), m % 60);
        const local = localDateTime(now, "Europe/Chisinau");
        expect(local?.date).toBe(getLocalDateString(now));
        const server = userDayDate(local!.date, local!.time, boundary);
        expect(server, `${boundary} ${local!.time}`).toBe(getUserDayDate(now, boundary));
      }
    }
  });

  it("date arithmetic and comparisons", () => {
    expect(addDaysIso("2026-12-31", 1)).toBe(addDays("2026-12-31", 1));
    expect(addDaysIso("2026-03-01", -1)).toBe("2026-02-28");
    expect(isBefore("2026-11-26", "23:00", "2026-11-27", "01:00")).toBe(true);
    expect(isBefore("2026-11-27", "00:30", "2026-11-27", "01:00")).toBe(true);
    expect(isBefore("2026-11-27", "08:00", "2026-11-27", "01:00")).toBe(false);
    expect(localDateTime(new Date(), "Not/AZone")).toBeNull();
  });
});
