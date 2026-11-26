/**
 * Fixtures of parse-day-report and how a parse result is scored against them (used by the eval script and
 * by the fixture unit test).
 */
import { normalizeSkillName } from "../parseDayReport.ts";
import type { DayEvent } from "../schema.ts";
import type { ParseContext, PlannedQuestContext } from "../types.ts";
import data from "./day-reports.json" with { type: "json" };

export type ExpectedSkill =
  | { kind: "existing"; skillId: string }
  | { kind: "new"; names?: string[]; attributesInclude?: string[] }
  | { kind: "none" };

export interface ExpectedEvent {
  skill: ExpectedSkill;
  /** null = any duration */
  hours: number | null;
  plannedQuestId: string | null;
  confidence?: "high" | "low";
}

export interface DayReportFixture {
  id: string;
  covers: string;
  text: string;
  plannedQuests?: PlannedQuestContext[];
  expected: { events: ExpectedEvent[]; ignoreExtraNone?: boolean; allowExtra?: boolean };
}

export const FIXTURE_REPORT_DATE = "2026-11-20";
export const HOURS_TOLERANCE = 0.3;

export const FIXTURES = data.fixtures as DayReportFixture[];

export function fixtureContext(fixture: DayReportFixture): ParseContext {
  return {
    skills: data.contexts.base.skills as ParseContext["skills"],
    plannedQuests: fixture.plannedQuests ?? [],
  };
}

const skillMatches = (expected: ExpectedSkill, actual: DayEvent["skill"]): boolean => {
  if (expected.kind !== actual.kind) return false;
  if (expected.kind === "existing" && actual.kind === "existing")
    return expected.skillId === actual.skillId;
  if (expected.kind === "new" && actual.kind === "new") {
    const nameOk =
      !expected.names ||
      expected.names.map(normalizeSkillName).includes(normalizeSkillName(actual.name));
    const attrsOk = (expected.attributesInclude ?? []).every((a) =>
      (actual.attributes as string[]).includes(a),
    );
    return nameOk && attrsOk;
  }
  return true;
};

const describeSkill = (s: DayEvent["skill"] | ExpectedSkill): string =>
  s.kind === "existing"
    ? `existing:${s.skillId}`
    : s.kind === "new"
      ? `new:${"name" in s ? s.name : (s.names ?? ["*"]).join("|")}`
      : "none";

export interface FixtureScore {
  id: string;
  correct: boolean;
  skillsMatched: number;
  skillsExpected: number;
  /** |actual − expected| / expected for every matched event with an expected duration */
  hoursDeviation: number[];
  problems: string[];
}

export function scoreFixture(fixture: DayReportFixture, events: DayEvent[]): FixtureScore {
  const problems: string[] = [];
  const used = new Set<number>();
  const hoursDeviation: number[] = [];
  let skillsMatched = 0;

  for (const exp of fixture.expected.events) {
    const index = events.findIndex((e, i) => !used.has(i) && skillMatches(exp.skill, e.skill));
    if (index < 0) {
      problems.push(`нет события ${describeSkill(exp.skill)}`);
      continue;
    }
    used.add(index);
    skillsMatched++;
    const got = events[index]!;
    if (exp.hours !== null) {
      const deviation = Math.abs(got.hours - exp.hours) / exp.hours;
      hoursDeviation.push(deviation);
      if (deviation > HOURS_TOLERANCE)
        problems.push(`${describeSkill(exp.skill)}: ${got.hours} ч вместо ~${exp.hours} ч`);
    }
    if (got.plannedQuestId !== exp.plannedQuestId) {
      problems.push(
        `${describeSkill(exp.skill)}: квест ${got.plannedQuestId ?? "null"} вместо ${exp.plannedQuestId ?? "null"}`,
      );
    }
    if (exp.confidence && got.confidence !== exp.confidence) {
      problems.push(
        `${describeSkill(exp.skill)}: confidence ${got.confidence} вместо ${exp.confidence}`,
      );
    }
  }

  events.forEach((e, i) => {
    if (used.has(i)) return;
    if (fixture.expected.allowExtra) return;
    if (e.skill.kind === "none" && fixture.expected.ignoreExtraNone) return;
    problems.push(`лишнее событие ${describeSkill(e.skill)} «${e.description}»`);
  });

  return {
    id: fixture.id,
    correct: problems.length === 0,
    skillsMatched,
    skillsExpected: fixture.expected.events.length,
    hoursDeviation,
    problems,
  };
}
