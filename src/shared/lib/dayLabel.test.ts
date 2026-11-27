import { describe, expect, it } from "vitest";

import { dayLabel } from "./dayLabel";

describe("dayLabel", () => {
  it("relative to the user's today, with the short date", () => {
    expect(dayLabel("2026-11-27", "2026-11-27")).toBe("Сегодня, 27 нояб.");
    expect(dayLabel("2026-11-28", "2026-11-27")).toBe("Завтра, 28 нояб.");
    expect(dayLabel("2026-11-26", "2026-11-27")).toBe("Вчера, 26 нояб.");
    expect(dayLabel("2026-11-30", "2026-11-27")).toBe("пн, 30 нояб.");
  });
});
