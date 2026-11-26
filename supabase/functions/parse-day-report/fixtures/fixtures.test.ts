import { describe, expect, it } from "vitest";

import type { AttributeCode, DayEvent } from "../schema.ts";
import { ModelOutputSchema, SKILL_ICON_KEYS } from "../schema.ts";
import { type ExpectedEvent, fixtureContext, FIXTURES, scoreFixture } from "./scoring.ts";

/** A perfect answer built from the expectations (new skills get their first accepted name) */
const perfect = (events: ExpectedEvent[]): DayEvent[] =>
  events.map((e) => ({
    description: "событие",
    hours: e.hours ?? 1,
    plannedQuestId: e.plannedQuestId,
    skill:
      e.skill.kind === "new"
        ? {
            kind: "new",
            name: e.skill.names?.[0] ?? "Что-то новое",
            attributes: (e.skill.attributesInclude ?? []) as AttributeCode[],
            icon: "misc",
          }
        : e.skill,
    confidence: e.confidence ?? "high",
    note: e.confidence === "low" ? "оценка" : null,
  })) as DayEvent[];

describe("day report fixtures", () => {
  it("20 fixtures with unique ids; texts 3–4000 chars; referenced skills / quests exist in the context", () => {
    expect(FIXTURES).toHaveLength(20);
    expect(new Set(FIXTURES.map((f) => f.id)).size).toBe(20);
    for (const f of FIXTURES) {
      expect(f.text.length, f.id).toBeGreaterThanOrEqual(3);
      expect(f.text.length, f.id).toBeLessThanOrEqual(4000);
      const ctx = fixtureContext(f);
      for (const e of f.expected.events) {
        if (e.skill.kind === "existing")
          expect(
            ctx.skills.map((s) => s.id),
            f.id,
          ).toContain(e.skill.skillId);
        if (e.plannedQuestId)
          expect(
            ctx.plannedQuests.map((q) => q.id),
            f.id,
          ).toContain(e.plannedQuestId);
      }
    }
  });

  it("a perfect answer scores as fully correct and passes the output schema", () => {
    for (const f of FIXTURES) {
      const events = perfect(f.expected.events);
      expect(scoreFixture(f, events), f.id).toMatchObject({ correct: true, problems: [] });
      // the same shape must be accepted by the model-output schema (new skills need ≥ 1 attribute there)
      const asModel = {
        events: events.map((e) =>
          e.skill.kind === "new" && e.skill.attributes.length === 0
            ? { ...e, skill: { ...e.skill, attributes: ["discipline"] } }
            : e,
        ),
      };
      expect(ModelOutputSchema.safeParse(asModel).success, f.id).toBe(true);
    }
    expect(SKILL_ICON_KEYS).toContain("misc");
  });

  it("the scorer catches wrong skill, hours beyond ±30%, a wrong quest link and extra events", () => {
    const f = FIXTURES.find((x) => x.id === "02-long-detailed")!;
    const events = perfect(f.expected.events);
    events[0] = { ...events[0]!, hours: 2 };
    events[1] = { ...events[1]!, plannedQuestId: null };
    events[2] = { ...events[2]!, skill: { kind: "existing", skillId: "s-read" } };
    events.push({
      ...events[3]!,
      skill: { kind: "new", name: "Йога", attributes: ["focus"], icon: "yoga" },
    });
    const score = scoreFixture(f, events);
    expect(score.correct).toBe(false);
    expect(score.problems.join("\n")).toMatch(/2 ч вместо ~0.7 ч/);
    expect(score.problems.join("\n")).toMatch(/квест null вместо q-code/);
    expect(score.problems.join("\n")).toMatch(/лишнее событие new:Йога/);
  });
});
