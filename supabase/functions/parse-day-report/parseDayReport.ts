/**
 * Core of parse-day-report, independent of Deno and Supabase (dependencies are injected → unit-testable):
 * request validation → daily limit → context → model call (shared attempt loop: timeout 20 s, one retry on
 * timeout / invalid output) → Zod validation → sanitizing → every attempt logged.
 */
import { formatZodIssues, runAttempts, utcDayStart } from "../_shared/ai/attempts.ts";
import { fail } from "../_shared/ai/http.ts";
import type { AiProvider } from "../_shared/ai/provider.ts";
import { resolveSkillRef } from "../_shared/ai/skills.ts";
import { buildDayReportRequest } from "./prompt.ts";
import {
  type DayEvent,
  LIMITS,
  type ModelOutput,
  ModelOutputSchema,
  ParseRequestSchema,
} from "./schema.ts";
import type { DayReportStore, ParseContext, ParseResult } from "./types.ts";

export { normalizeSkillName } from "../_shared/ai/skills.ts";

export interface ParseDeps {
  store: DayReportStore;
  provider: AiProvider;
  now?: () => Date;
  timeoutMs?: number;
}

/**
 * Make validated model output safe to show and apply: hours into 0.1–8 (step 0.1), unknown / repeated
 * planned quest ids → null, skills checked by the shared rules (foreign id → a new skill to review, a name
 * matching an existing skill / alias → that skill, icon outside the list → "misc", ≤ 2 attributes),
 * a note on every low-confidence event.
 */
export function sanitizeEvents(output: ModelOutput, context: ParseContext): DayEvent[] {
  const questIds = new Set(context.plannedQuests.map((q) => q.id));
  const usedQuests = new Set<string>();

  return output.events.map((e) => {
    const notes: string[] = e.note ? [e.note] : [];
    let confidence = e.confidence;

    let hours = Math.round(e.hours * 10) / 10;
    if (hours < LIMITS.hoursMin) {
      hours = LIMITS.hoursMin;
      confidence = "low";
      notes.push("длительность меньше 0.1 ч — поставлено 0.1 ч");
    } else if (hours > LIMITS.hoursMax) {
      hours = LIMITS.hoursMax;
      confidence = "low";
      notes.push(`больше ${LIMITS.hoursMax} ч на одно занятие — поставлено ${LIMITS.hoursMax} ч`);
    }

    let plannedQuestId: string | null = null;
    if (e.plannedQuestId && questIds.has(e.plannedQuestId) && !usedQuests.has(e.plannedQuestId)) {
      plannedQuestId = e.plannedQuestId;
      usedQuests.add(plannedQuestId);
    }

    const resolved = resolveSkillRef(e.skill, context.skills, e.description);
    if (resolved.reviewNote) {
      confidence = "low";
      notes.push(resolved.reviewNote);
    }

    if (confidence === "low" && notes.length === 0) notes.push("модель не уверена в этом событии");

    return {
      description: e.description.trim().slice(0, 200),
      hours,
      plannedQuestId,
      skill: resolved.skill,
      confidence,
      note: notes.length > 0 ? notes.join("; ") : null,
    };
  });
}

export async function parseDayReport(
  deps: ParseDeps,
  userId: string,
  body: unknown,
): Promise<ParseResult> {
  const now = deps.now ?? (() => new Date());

  // 1. Request
  const request = ParseRequestSchema.safeParse(body);
  if (!request.success) return fail(400, "INVALID_INPUT", "Нужны reportDate (YYYY-MM-DD) и text");
  const { reportDate } = request.data;
  const text = request.data.text.trim();
  if (Number.isNaN(Date.parse(`${reportDate}T00:00:00Z`))) {
    return fail(400, "INVALID_INPUT", "Неверная дата отчёта");
  }
  if (text.length < LIMITS.textMin || text.length > LIMITS.textMax) {
    return fail(
      400,
      "INVALID_INPUT",
      `Текст должен быть от ${LIMITS.textMin} до ${LIMITS.textMax} символов`,
    );
  }

  // 2. Daily limit (requests since 00:00 UTC; a retry is not a new request)
  const used = await deps.store.countParseRequestsSince(userId, utcDayStart(now()));
  if (used >= LIMITS.parsesPerDay) {
    return fail(429, "RATE_LIMIT", `Лимит ${LIMITS.parsesPerDay} разборов в сутки исчерпан`);
  }

  // 3. Context
  const context = await deps.store.loadContext(userId, reportDate);

  // 4. Model: up to 2 attempts
  const result = await runAttempts<DayEvent[]>({
    provider: deps.provider,
    timeoutMs: deps.timeoutMs ?? LIMITS.timeoutMs,
    buildRequest: (retry) => buildDayReportRequest({ reportDate, text, context, retry }),
    validate(raw) {
      const parsed = ModelOutputSchema.safeParse(raw);
      return parsed.success
        ? { ok: true, value: sanitizeEvents(parsed.data, context) }
        : { ok: false, error: formatZodIssues(parsed.error) };
    },
    log: (record) =>
      deps.store.logAttempt({
        userId,
        reportDate,
        inputText: text,
        model: deps.provider.model,
        attempt: record.attempt,
        rawOutput: record.rawOutput,
        parsedEvents: record.value,
        status: record.status,
        errorMessage: record.errorMessage,
        latencyMs: record.latencyMs,
        usage: record.usage,
      }),
  });

  if (result.ok) return { ok: true, parseId: result.parseId, events: result.value };
  const messages = {
    AI_TIMEOUT: "Модель не ответила вовремя",
    AI_INVALID_OUTPUT: "Модель вернула некорректный ответ",
    AI_ERROR: "Не удалось разобрать отчёт",
  } as const;
  return fail(result.status, result.code, messages[result.code]);
}
