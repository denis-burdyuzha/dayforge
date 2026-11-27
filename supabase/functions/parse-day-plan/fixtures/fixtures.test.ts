import { describe, expect, it } from "vitest";

import type { AttributeCode } from "../../_shared/ai/catalog.ts";
import { ModelOutputSchema, type PlanItem } from "../schema.ts";
import {
  type DayPlanFixture,
  expectedDate,
  type ExpectedItem,
  fixtureContext,
  fixturePlanDate,
  FIXTURES,
  scorePlanFixture,
  timeMatches,
} from "./scoring.ts";

const PART_TIME: Record<string, string> = {
  morning: "08:00",
  afternoon: "13:00",
  evening: "18:00",
};

/** A perfect answer built from the expectations (dates resolved) */
const perfect = (
  fixture: DayPlanFixture,
  items: ExpectedItem[] = fixture.expected.items,
): PlanItem[] =>
  items.map((e) => {
    const skill = Array.isArray(e.skill) ? e.skill[0]! : e.skill;
    const time = e.time ? (PART_TIME[e.time] ?? e.time.replace(">=", "")) : "10:00";
    return {
      title: `${e.match[0]} — пункт`,
      date: expectedDate(fixture, e),
      startTime: time,
      durationMinutes: e.minutes ?? 30,
      skill:
        skill.kind === "new"
          ? {
              kind: "new",
              name: skill.names?.[0] ?? "Новое",
              attributes: (skill.attributesInclude ?? ["focus"]) as AttributeCode[],
              icon: "misc",
            }
          : skill,
      duplicateOfExisting: e.duplicate ?? false,
      confidence: "high",
      note: null,
    };
  });

describe("day plan fixtures", () => {
  it("18 fixtures with unique ids; texts 3–4000 chars; referenced skills exist in the context", () => {
    expect(FIXTURES).toHaveLength(18);
    expect(new Set(FIXTURES.map((f) => f.id)).size).toBe(18);
    for (const f of FIXTURES) {
      expect(f.text.length, f.id).toBeGreaterThanOrEqual(3);
      expect(f.text.length, f.id).toBeLessThanOrEqual(4000);
      const skillIds = fixtureContext(f).skills.map((s) => s.id);
      for (const e of f.expected.items) {
        for (const s of Array.isArray(e.skill) ? e.skill : [e.skill]) {
          if (s.kind === "existing") expect(skillIds, f.id).toContain(s.skillId);
        }
      }
    }
  });

  it("a perfect answer scores as fully correct and passes the output schema", () => {
    for (const f of FIXTURES) {
      const items = perfect(f);
      expect(scorePlanFixture(f, items), f.id).toMatchObject({ correct: true, problems: [] });
      // the model's form of the same answer: date "plan" | "next"
      const modelItems = items.map((it, i) => ({
        ...it,
        date: f.expected.items[i]?.date ?? "plan",
      }));
      expect(ModelOutputSchema.safeParse({ items: modelItems }).success, f.id).toBe(true);
    }
  });

  it("the scorer catches a wrong date", () => {
    const f = FIXTURES.find((x) => x.id === "17-tonight-and-tomorrow-morning")!;
    const items = perfect(f).map((it) => ({ ...it, date: fixturePlanDate(f) }));
    expect(scorePlanFixture(f, items).problems.join("\n")).toMatch(
      /дата 2026-11-27 вместо 2026-11-28/,
    );
  });

  it("time rules: exact, part of the day, >=", () => {
    expect(timeMatches("07:00", "07:00")).toBe(true);
    expect(timeMatches("07:00", "07:05")).toBe(false);
    expect(timeMatches("morning", "11:30")).toBe(true);
    expect(timeMatches("morning", "12:00")).toBe(false);
    expect(timeMatches("evening", "23:00")).toBe(true);
    expect(timeMatches(">=15:30", "15:30")).toBe(true);
    expect(timeMatches(">=15:30", "15:00")).toBe(false);
    expect(timeMatches("evening", null)).toBe(false);
    expect(timeMatches(undefined, null)).toBe(true);
  });

  it("the scorer catches a wrong time, a past time, a wrong skill, a missed duplicate and invented items", () => {
    const f = FIXTURES.find((x) => x.id === "09-duplicates")!;
    const items = perfect(f);
    items[0] = { ...items[0]!, duplicateOfExisting: false };
    items[1] = { ...items[1]!, startTime: "20:00", skill: { kind: "none" } };
    items.push({
      ...items[2]!,
      title: "Бассейн",
      skill: { kind: "none" },
      duplicateOfExisting: false,
    });
    const score = scorePlanFixture(f, items);
    expect(score.correct).toBe(false);
    const text = score.problems.join("\n");
    expect(text).toMatch(/duplicateOfExisting false/);
    expect(text).toMatch(/время 20:00 вместо afternoon/);
    expect(text).toMatch(/навык none/);
    expect(text).toMatch(/лишний пункт «Бассейн»/);
    expect(score.extraItems).toBe(1);

    const late = FIXTURES.find((x) => x.id === "05-today-after-1530")!;
    const past = perfect(late);
    past[0] = { ...past[0]!, startTime: "08:00" };
    expect(scorePlanFixture(late, past).problems.join("\n")).toMatch(/08:00 раньше текущего 15:30/);
  });
});
