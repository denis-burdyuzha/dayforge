/**
 * npm run eval:day-report — runs every parse-day-report fixture through the REAL model (the same path as the
 * Edge Function: retry, Zod validation, sanitizing) and prints per-fixture results and a summary.
 * Key: ANTHROPIC_API_KEY (from .env.local or the environment); model: AI_MODEL (default claude-haiku-5-5).
 * Without a key it says so and exits successfully. Costs real API money (~20 short requests).
 */
/* eslint-disable no-console -- this file IS a console report */
import { existsSync } from "node:fs";

import { it } from "vitest";

import { AnthropicProvider } from "../supabase/functions/_shared/ai/anthropicProvider.ts";
import type { TokenUsage } from "../supabase/functions/_shared/ai/provider.ts";
import {
  FIXTURE_REPORT_DATE,
  fixtureContext,
  FIXTURES,
  type FixtureScore,
  scoreFixture,
} from "../supabase/functions/parse-day-report/fixtures/scoring.ts";
import { parseDayReport } from "../supabase/functions/parse-day-report/parseDayReport.ts";
import type { AttemptLog, DayReportStore } from "../supabase/functions/parse-day-report/types.ts";
import { summarizeUsage } from "./evalUsage.ts";

it("eval: parse-day-report fixtures against the real model", async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log(
      "eval:day-report — ANTHROPIC_API_KEY не задан (.env.local или окружение). Пропускаю прогон.",
    );
    return;
  }

  const provider = new AnthropicProvider({
    apiKey,
    model: process.env.AI_MODEL,
    timeoutMs: 20_000,
  });
  console.log(`eval:day-report — модель ${provider.model}, фикстур: ${FIXTURES.length}\n`);

  const scores: FixtureScore[] = [];
  const failures: string[] = [];
  let attempts = 0;
  let retries = 0;
  const usages: Array<TokenUsage | null> = [];

  for (const fixture of FIXTURES) {
    const logs: AttemptLog[] = [];
    const store: DayReportStore = {
      countParseRequestsSince: async () => 0,
      loadContext: async () => fixtureContext(fixture),
      logAttempt: async (log) => {
        logs.push(log);
        return `eval-${fixture.id}-${logs.length}`;
      },
    };
    const result = await parseDayReport({ store, provider }, "eval-user", {
      reportDate: FIXTURE_REPORT_DATE,
      text: fixture.text,
    });
    attempts += logs.length;
    usages.push(...logs.map((l) => l.usage));
    retries += Math.max(0, logs.length - 1);

    if (!result.ok) {
      failures.push(`${fixture.id}: ${result.code}`);
      scores.push({
        id: fixture.id,
        correct: false,
        skillsMatched: 0,
        skillsExpected: fixture.expected.events.length,
        hoursDeviation: [],
        problems: [`ошибка ${result.code} (${logs.map((l) => l.errorMessage).join(" | ")})`],
      });
    } else {
      scores.push(scoreFixture(fixture, result.events));
    }
    const s = scores[scores.length - 1]!;
    const hours = s.hoursDeviation.length
      ? ` | часы ±${Math.round((100 * s.hoursDeviation.reduce((a, b) => a + b, 0)) / s.hoursDeviation.length)}%`
      : "";
    console.log(
      `${s.correct ? "✓" : "✗"} ${fixture.id} — навыки ${s.skillsMatched}/${s.skillsExpected}${hours}` +
        (s.problems.length ? `\n    ${s.problems.join("\n    ")}` : ""),
    );
  }

  const correct = scores.filter((s) => s.correct).length;
  const matched = scores.reduce((a, s) => a + s.skillsMatched, 0);
  const expected = scores.reduce((a, s) => a + s.skillsExpected, 0);
  const deviations = scores.flatMap((s) => s.hoursDeviation);
  console.log(
    `\nИтог: полностью корректно ${correct}/${scores.length} (${Math.round((100 * correct) / scores.length)}%)` +
      ` | навыки ${matched}/${expected}` +
      (deviations.length
        ? ` | среднее отклонение часов ${Math.round((100 * deviations.reduce((a, b) => a + b, 0)) / deviations.length)}%`
        : "") +
      ` | попыток ${attempts}, повторов ${retries}` +
      (failures.length ? ` | ошибки: ${failures.join(", ")}` : ""),
  );
  console.log(summarizeUsage(provider.model, usages));
});
