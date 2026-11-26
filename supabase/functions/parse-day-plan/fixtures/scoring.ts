/**
 * Fixtures of parse-day-plan and how a parse result is scored against them (used by the eval script and by
 * the fixture unit test). An expected item is found by title keywords + skill; then its time, duration and
 * duplicate flag are checked. Times: "HH:MM" exact, "morning" | "afternoon" | "evening", ">=HH:MM", or any.
 * For a plan on today no item may start before nowLocal.
 */
import { normalizeSkillName } from "../../_shared/ai/skills.ts";
import type { PlanItem } from "../schema.ts";
import type { ExistingQuestContext, PlanParseContext } from "../types.ts";
import data from "./day-plans.json" with { type: "json" };

export type ExpectedSkill =
  | { kind: "existing"; skillId: string }
  | { kind: "new"; names?: string[]; attributesInclude?: string[] }
  | { kind: "none" };

export interface ExpectedItem {
  /** lower-case fragments; the item title must contain one of them */
  match: string[];
  /** one skill or any of several */
  skill: ExpectedSkill | ExpectedSkill[];
  time?: string;
  /** expected duration (±30%) */
  minutes?: number;
  duplicate?: boolean;
}

export interface DayPlanFixture {
  id: string;
  covers: string;
  today: boolean;
  nowLocal: string;
  text: string;
  existingQuests?: ExistingQuestContext[];
  expected: { items: ExpectedItem[]; ignoreExtraNone?: boolean };
}

/** "today" of the fixtures; a fixture with today: false plans the next day */
export const FIXTURE_TODAY = "2026-11-27";
export const FIXTURE_TOMORROW = "2026-11-28";
export const DURATION_TOLERANCE = 0.3;

export const FIXTURES = data.fixtures as DayPlanFixture[];

export const fixturePlanDate = (f: DayPlanFixture) => (f.today ? FIXTURE_TODAY : FIXTURE_TOMORROW);

export function fixtureContext(fixture: DayPlanFixture): PlanParseContext {
  return {
    skills: data.skills as PlanParseContext["skills"],
    quests: fixture.existingQuests ?? [],
  };
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

const PARTS: Record<string, [string, string]> = {
  morning: ["07:00", "11:59"],
  afternoon: ["12:00", "16:59"],
  evening: ["17:00", "23:00"],
};

export function timeMatches(expected: string | undefined, actual: string | null): boolean {
  if (!expected) return true;
  if (!actual) return false;
  const part = PARTS[expected];
  if (part)
    return toMinutes(actual) >= toMinutes(part[0]) && toMinutes(actual) <= toMinutes(part[1]);
  if (expected.startsWith(">=")) return toMinutes(actual) >= toMinutes(expected.slice(2));
  return actual === expected;
}

const oneSkillMatches = (expected: ExpectedSkill, actual: PlanItem["skill"]): boolean => {
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

export const skillMatches = (expected: ExpectedItem["skill"], actual: PlanItem["skill"]) =>
  (Array.isArray(expected) ? expected : [expected]).some((e) => oneSkillMatches(e, actual));

const titleMatches = (exp: ExpectedItem, title: string) => {
  const t = title.toLowerCase();
  return exp.match.some((m) => t.includes(m));
};

const describeSkill = (s: PlanItem["skill"]): string =>
  s.kind === "existing" ? `existing:${s.skillId}` : s.kind === "new" ? `new:${s.name}` : "none";

export interface PlanFixtureScore {
  id: string;
  correct: boolean;
  itemsMatched: number;
  itemsExpected: number;
  skillsCorrect: number;
  timesCorrect: number;
  timesChecked: number;
  /** items that match nothing in the text (made up / split / out of plan) */
  extraItems: number;
  problems: string[];
}

export function scorePlanFixture(fixture: DayPlanFixture, items: PlanItem[]): PlanFixtureScore {
  const problems: string[] = [];
  const used = new Set<number>();
  let itemsMatched = 0;
  let skillsCorrect = 0;
  let timesCorrect = 0;
  let timesChecked = 0;

  for (const exp of fixture.expected.items) {
    // prefer an item matching title AND skill, then title only (to report a wrong skill), in order
    let index = items.findIndex(
      (it, i) => !used.has(i) && titleMatches(exp, it.title) && skillMatches(exp.skill, it.skill),
    );
    if (index < 0) index = items.findIndex((it, i) => !used.has(i) && titleMatches(exp, it.title));
    if (index < 0) {
      problems.push(`нет пункта «${exp.match[0]}…»`);
      continue;
    }
    used.add(index);
    itemsMatched++;
    const got = items[index]!;
    const label = `«${got.title}»`;

    if (skillMatches(exp.skill, got.skill)) skillsCorrect++;
    else problems.push(`${label}: навык ${describeSkill(got.skill)}`);

    if (exp.time) {
      timesChecked++;
      if (timeMatches(exp.time, got.startTime)) timesCorrect++;
      else problems.push(`${label}: время ${got.startTime ?? "null"} вместо ${exp.time}`);
    }
    if (exp.minutes !== undefined) {
      const deviation = Math.abs(got.durationMinutes - exp.minutes) / exp.minutes;
      if (deviation > DURATION_TOLERANCE)
        problems.push(`${label}: ${got.durationMinutes} мин вместо ~${exp.minutes}`);
    }
    if ((exp.duplicate ?? false) !== got.duplicateOfExisting) {
      problems.push(`${label}: duplicateOfExisting ${got.duplicateOfExisting}`);
    }
  }

  // global rules: nothing in the past on today; inferred times inside the day window
  for (const it of items) {
    if (fixture.today && it.startTime && toMinutes(it.startTime) < toMinutes(fixture.nowLocal)) {
      problems.push(`«${it.title}»: ${it.startTime} раньше текущего ${fixture.nowLocal}`);
    }
  }

  let extraItems = 0;
  items.forEach((it, i) => {
    if (used.has(i)) return;
    if (it.skill.kind === "none" && fixture.expected.ignoreExtraNone) return;
    extraItems++;
    problems.push(`лишний пункт «${it.title}» (${describeSkill(it.skill)})`);
  });

  return {
    id: fixture.id,
    correct: problems.length === 0,
    itemsMatched,
    itemsExpected: fixture.expected.items.length,
    skillsCorrect,
    timesCorrect,
    timesChecked,
    extraItems,
    problems,
  };
}
