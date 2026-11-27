/**
 * npm run eval:day-plan — runs every parse-day-plan fixture through the REAL model (the same path as the Edge
 * Function: retry, Zod validation, sanitizing) and prints per-fixture results, a summary by error type and the
 * token usage (cache reads, cost). Key: ANTHROPIC_API_KEY (from .env.local or the environment); model:
 * AI_MODEL (default claude-haiku-5-5). Without a key it says so and exits successfully. Costs real API money
 * (~15 short requests).
 */
/* eslint-disable no-console -- this file IS a console report */
import { existsSync } from "node:fs";

import { it } from "vitest";

import { AnthropicProvider } from "../supabase/functions/_shared/ai/anthropicProvider.ts";
import type { TokenUsage } from "../supabase/functions/_shared/ai/provider.ts";
import {
  FIXTURE_TODAY,
  fixtureContext,
  fixturePlanDate,
  FIXTURES,
  type PlanFixtureScore,
  scorePlanFixture,
} from "../supabase/functions/parse-day-plan/fixtures/scoring.ts";
import { parseDayPlan } from "../supabase/functions/parse-day-plan/parseDayPlan.ts";
import type { DayPlanStore, PlanAttemptLog } from "../supabase/functions/parse-day-plan/types.ts";
import { summarizeUsage } from "./evalUsage.ts";

const PROBLEM_KINDS: Array<[RegExp, string]> = [
  [/: навык /, "неверный навык"],
  [/раньше текущего/, "время в прошлом"],
  [/: время /, "неверное время"],
  [/: дата /, "неверная дата (plan/next)"],
  [/ мин вместо /, "длительность вне ±30%"],
  [/duplicateOfExisting/, "дубль не распознан / ложный дубль"],
  [/^лишний пункт/, "выдуманный / лишний пункт"],
  [/^нет пункта/, "пропущенный пункт"],
  [/^ошибка /, "ошибка разбора"],
];

it("eval: parse-day-plan fixtures against the real model", async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log(
      "eval:day-plan — ANTHROPIC_API_KEY не задан (.env.local или окружение). Пропускаю прогон.",
    );
    return;
  }

  const provider = new AnthropicProvider({
    apiKey,
    model: process.env.AI_MODEL,
    timeoutMs: 20_000,
  });
  console.log(`eval:day-plan — модель ${provider.model}, фикстур: ${FIXTURES.length}\n`);

  const scores: PlanFixtureScore[] = [];
  const usages: Array<TokenUsage | null> = [];
  let attempts = 0;
  let retries = 0;

  for (const fixture of FIXTURES) {
    const logs: PlanAttemptLog[] = [];
    const store: DayPlanStore = {
      countParseRequestsSince: async () => 0,
      loadContext: async () => fixtureContext(fixture),
      logAttempt: async (log) => {
        logs.push(log);
        return `eval-${fixture.id}-${logs.length}`;
      },
    };
    // the fixture's "now": FIXTURE_TODAY at nowLocal, in UTC
    const now = new Date(`${FIXTURE_TODAY}T${fixture.nowLocal}:00Z`);
    const result = await parseDayPlan({ store, provider, now: () => now }, "eval-user", {
      planDate: fixturePlanDate(fixture),
      text: fixture.text,
      nowLocal: fixture.nowLocal,
      timezone: "UTC",
      dayStartTime: fixture.dayStartTime ?? "04:00",
    });
    attempts += logs.length;
    retries += Math.max(0, logs.length - 1);
    usages.push(...logs.map((l) => l.usage));

    const s: PlanFixtureScore = result.ok
      ? scorePlanFixture(fixture, result.items)
      : {
          id: fixture.id,
          correct: false,
          itemsMatched: 0,
          itemsExpected: fixture.expected.items.length,
          skillsCorrect: 0,
          timesCorrect: 0,
          timesChecked: 0,
          extraItems: 0,
          problems: [`ошибка ${result.code} (${logs.map((l) => l.errorMessage).join(" | ")})`],
        };
    scores.push(s);
    const lines = result.ok
      ? result.items.map(
          (i) =>
            `      ${i.startTime ?? "--:--"} ${String(i.durationMinutes).padStart(3)} мин  ${i.title}` +
            `  [${i.skill.kind === "existing" ? i.skill.skillId : i.skill.kind === "new" ? `new:${i.skill.name}` : "none"}]` +
            `${i.duplicateOfExisting ? " дубль" : ""}${i.confidence === "low" ? ` (low: ${i.note})` : ""}`,
        )
      : [];
    console.log(
      `${s.correct ? "✓" : "✗"} ${fixture.id} — пункты ${s.itemsMatched}/${s.itemsExpected}, навыки ${s.skillsCorrect}/${s.itemsExpected}, время ${s.timesCorrect}/${s.timesChecked}` +
        (s.problems.length ? `\n    ${s.problems.join("\n    ")}` : "") +
        (lines.length ? `\n${lines.join("\n")}` : ""),
    );
  }

  const correct = scores.filter((s) => s.correct).length;
  const sum = (k: keyof PlanFixtureScore) => scores.reduce((a, s) => a + (s[k] as number), 0);
  const kinds = new Map<string, number>();
  for (const p of scores.flatMap((s) => s.problems)) {
    const kind = PROBLEM_KINDS.find(([re]) => re.test(p))?.[1] ?? "прочее";
    kinds.set(kind, (kinds.get(kind) ?? 0) + 1);
  }
  console.log(
    `\nИтог: полностью корректно ${correct}/${scores.length} (${Math.round((100 * correct) / scores.length)}%)` +
      ` | пункты ${sum("itemsMatched")}/${sum("itemsExpected")}` +
      ` | навыки ${sum("skillsCorrect")}/${sum("itemsExpected")}` +
      ` | время ${sum("timesCorrect")}/${sum("timesChecked")}` +
      ` | лишних пунктов ${sum("extraItems")}` +
      ` | попыток ${attempts}, повторов ${retries}`,
  );
  if (kinds.size) {
    console.log(
      "Ошибки по типам: " +
        [...kinds.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([k, n]) => `${k} — ${n}`)
          .join("; "),
    );
  }
  console.log(summarizeUsage(provider.model, usages));
});
