import { describe, expect, it } from "vitest";

import {
  BEDTIME_OPTIONS,
  type BedtimeChoice,
  bedtimeToDayStart,
  dayStartExplanation,
  dayStartToBedtime,
} from "./bedtime";

describe("bedtime ↔ day boundary", () => {
  it("the options: «До полуночи», then 00:00 … 04:00 every 30 minutes", () => {
    expect(BEDTIME_OPTIONS.map((o) => o.label)).toEqual([
      "До полуночи",
      "00:00",
      "00:30",
      "01:00",
      "01:30",
      "02:00",
      "02:30",
      "03:00",
      "03:30",
      "04:00",
    ]);
  });

  it("choice → boundary: «До полуночи» = 04:00, otherwise bedtime + 2 h, at most 06:00", () => {
    const table: Array<[BedtimeChoice, string]> = [
      ["before-midnight", "04:00"],
      ["00:00", "02:00"],
      ["00:30", "02:30"],
      ["01:00", "03:00"],
      ["01:30", "03:30"],
      ["02:00", "04:00"],
      ["02:30", "04:30"],
      ["03:00", "05:00"],
      ["03:30", "05:30"],
      ["04:00", "06:00"],
    ];
    for (const [choice, start] of table) expect(bedtimeToDayStart(choice), choice).toBe(start);
  });

  it("boundary → choice and back is stable for every option", () => {
    for (const { value } of BEDTIME_OPTIONS) {
      expect(dayStartToBedtime(bedtimeToDayStart(value), value), value).toBe(value);
    }
    // without a remembered choice: the unambiguous ones come back, 04:00 means «До полуночи»
    for (const { value } of BEDTIME_OPTIONS.filter((o) => o.value !== "02:00")) {
      expect(dayStartToBedtime(bedtimeToDayStart(value)), value).toBe(value);
    }
    expect(dayStartToBedtime("04:00")).toBe("before-midnight");
    expect(dayStartToBedtime("04:00:00")).toBe("before-midnight"); // Postgres time
  });

  it("a remembered choice only wins while it still gives the stored boundary", () => {
    expect(dayStartToBedtime("04:00", "02:00")).toBe("02:00");
    expect(dayStartToBedtime("04:00", "01:00")).toBe("before-midnight"); // stale: 01:00 gives 03:00
    expect(dayStartToBedtime("03:00", "02:00")).toBe("01:00");
  });

  it("a boundary outside the list shows the nearest choice", () => {
    expect(dayStartToBedtime("05:00")).toBe("03:00");
    expect(dayStartToBedtime("06:00")).toBe("04:00");
    expect(dayStartToBedtime("01:00")).toBe("00:00"); // an old setting below 02:00
    expect(dayStartToBedtime("00:00")).toBe("00:00");
    expect(dayStartToBedtime("04:20")).toBe("02:30"); // not on the 30-minute grid → rounded
  });

  it("the hint is computed from the choice", () => {
    expect(dayStartExplanation("before-midnight")).toBe(
      "День для Dayforge заканчивается в 04:00 — так поздние дела не потеряются.",
    );
    expect(dayStartExplanation("02:00")).toBe(
      "Всё, что ты делаешь до 04:00, засчитается в прошедший день. Например, отчёт в 01:30 попадёт во вчерашний день.",
    );
    expect(dayStartExplanation("04:00")).toContain("до 06:00");
    expect(dayStartExplanation("04:00")).toContain("отчёт в 03:30");
    // 02:00 boundary: 02:00 − 2:30 would be before midnight → 01:30
    expect(dayStartExplanation("00:00")).toContain("до 02:00");
    expect(dayStartExplanation("00:00")).toContain("отчёт в 01:30");
  });
});
