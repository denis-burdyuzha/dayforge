/**
 * Core of parse-day-plan, independent of Deno and Supabase (dependencies are injected → unit-testable):
 * request validation → daily limit (10, separate from reports) → context → model call (shared attempt loop)
 * → Zod validation → sanitizing → every attempt logged.
 */
import { formatZodIssues, runAttempts, utcDayStart } from "../_shared/ai/attempts.ts";
import { fail } from "../_shared/ai/http.ts";
import type { AiProvider } from "../_shared/ai/provider.ts";
import { normalizeSkillName, resolveSkillRef } from "../_shared/ai/skills.ts";
import {
  addDaysIso,
  isBefore,
  localDateTime,
  toHHMM,
  toMinutes,
  userDayDate,
} from "../_shared/ai/userDay.ts";
import { buildDayPlanRequest, planDateStatus } from "./prompt.ts";
import {
  HHMM,
  LIMITS,
  type ModelOutput,
  ModelOutputSchema,
  ParseRequestSchema,
  type PlanItem,
} from "./schema.ts";
import type { DayPlanStore, PlanParseContext, PlanParseResult } from "./types.ts";

export interface PlanParseDeps {
  store: DayPlanStore;
  provider: AiProvider;
  now?: () => Date;
  timeoutMs?: number;
}

/** The client's local date (YYYY-MM-DD) in `timezone`, or null for an unknown zone */
export function localDate(now: Date, timezone: string): string | null {
  return localDateTime(now, timezone)?.date ?? null;
}

export interface SanitizeOptions {
  /** the plan date ("plan" items); "next" items go to the day after it */
  planDate: string;
  /** the user's day today (by the day boundary) — items on earlier dates are never moved */
  userToday: string;
  /** the local calendar date and time now — «the past» is everything before this moment */
  calendarDate: string;
  nowLocal: string;
  /**
   * may an item go to the next day? Only when the plan date is already in progress and either the text mentions
   * «завтра» or it is evening (≥ 18:00); otherwise a "next" from the model is put back on the plan date
   * (the model over-uses "next" — see the eval).
   */
  allowNext?: boolean;
}

/** the server rule for options.allowNext */
export function nextDayAllowed(
  status: "in_progress" | "ahead",
  text: string,
  nowLocal: string,
): boolean {
  return status === "in_progress" && (/завтр/i.test(text) || toMinutes(nowLocal) >= 18 * 60);
}

const padTime = (t: string) => (/^\d:\d\d$/.test(t) ? `0${t}` : t);

/**
 * Make validated model output safe to show and apply:
 * - date "plan" → planDate, "next" → planDate + 1;
 * - duration → a multiple of 5 within 5–480 (out of range → low + note);
 * - startTime must be HH:MM (else null + low); on a date that is the user's today or later, a moment already in
 *   the past (date + time before now) moves after now — per date, cascading in time order, each after the
 *   previous one (low + note); the plan is never put into the past;
 * - skills by the shared rules (foreign id → a new skill to review, alias → existing, icon fallback);
 * - duplicateOfExisting is also set when the title equals a quest already on the SAME date;
 * - a note on every low-confidence item.
 */
export function sanitizeItems(
  output: ModelOutput,
  context: PlanParseContext,
  options: SanitizeOptions,
): PlanItem[] {
  const nextDate = addDaysIso(options.planDate, 1);
  const allowNext = options.allowNext ?? true;
  const dateOf = (item: ModelOutput["items"][number]) =>
    item.date === "next" && allowNext ? nextDate : options.planDate;
  const existingByDate = new Set(
    context.quests.map((q) => `${q.date}|${normalizeSkillName(q.title)}`),
  );
  const nowMin = toMinutes(options.nowLocal);

  /** index → the new start of a past item (null: no time left on its date) */
  const shifted = new Map<number, string | null>();
  for (const date of [options.planDate, nextDate]) {
    if (date < options.userToday) continue;
    /** the first free 5-minute slot after now; null — the whole date is already in the past */
    let cursor =
      date === options.calendarDate
        ? Math.ceil(nowMin / LIMITS.durationStep) * LIMITS.durationStep
        : null;
    const past = output.items
      .map((item, index) => ({ item, index, time: padTime(item.startTime?.trim() ?? "") }))
      .filter(
        ({ item, time }) =>
          dateOf(item) === date &&
          HHMM.test(time) &&
          isBefore(date, time, options.calendarDate, options.nowLocal),
      )
      .sort((a, b) => toMinutes(a.time) - toMinutes(b.time) || a.index - b.index);
    for (const { item, index } of past) {
      const duration = Math.min(
        LIMITS.durationMax,
        Math.max(
          LIMITS.durationMin,
          Math.round(item.durationMinutes / LIMITS.durationStep) * LIMITS.durationStep,
        ),
      );
      if (cursor !== null && cursor < 24 * 60) {
        shifted.set(index, toHHMM(cursor));
        cursor += duration;
      } else {
        shifted.set(index, null);
      }
    }
  }

  return output.items.map((item, index) => {
    const date = dateOf(item);
    const notes: string[] = item.note ? [item.note] : [];
    let confidence = item.confidence;

    let duration = Math.round(item.durationMinutes / LIMITS.durationStep) * LIMITS.durationStep;
    if (duration < LIMITS.durationMin) {
      duration = LIMITS.durationMin;
      confidence = "low";
      notes.push(
        `длительность меньше ${LIMITS.durationMin} мин — поставлено ${LIMITS.durationMin} мин`,
      );
    } else if (duration > LIMITS.durationMax) {
      duration = LIMITS.durationMax;
      confidence = "low";
      notes.push(
        `больше ${LIMITS.durationMax / 60} ч на один пункт — поставлено ${LIMITS.durationMax / 60} ч`,
      );
    }

    let startTime: string | null = item.startTime?.trim() || null;
    if (startTime && /^\d:\d\d$/.test(startTime)) startTime = `0${startTime}`;
    if (startTime && !HHMM.test(startTime)) {
      startTime = null;
      confidence = "low";
      notes.push("время не распознано — укажи вручную");
    }
    if (startTime && shifted.has(index)) {
      const next = shifted.get(index) ?? null;
      notes.push(
        next
          ? `время ${startTime} уже прошло — сдвинуто на ${next}`
          : `время ${startTime} уже прошло`,
      );
      startTime = next;
      confidence = "low";
    }

    const title = item.title.trim().replace(/\s+/g, " ").slice(0, 120);
    const resolved = resolveSkillRef(item.skill, context.skills, title);
    if (resolved.reviewNote) {
      confidence = "low";
      notes.push(resolved.reviewNote);
    }

    const duplicateOfExisting =
      item.duplicateOfExisting || existingByDate.has(`${date}|${normalizeSkillName(title)}`);

    if (confidence === "low" && notes.length === 0) notes.push("модель не уверена в этом пункте");

    return {
      title,
      date,
      startTime,
      durationMinutes: duration,
      skill: resolved.skill,
      duplicateOfExisting,
      confidence,
      note: notes.length > 0 ? notes.join("; ") : null,
    };
  });
}

export async function parseDayPlan(
  deps: PlanParseDeps,
  userId: string,
  body: unknown,
): Promise<PlanParseResult> {
  const now = deps.now ?? (() => new Date());

  // 1. Request
  const request = ParseRequestSchema.safeParse(body);
  if (!request.success) {
    return fail(
      400,
      "INVALID_INPUT",
      "Нужны planDate (YYYY-MM-DD), text, nowLocal (HH:MM) и timezone",
    );
  }
  const { planDate, nowLocal, timezone, dayStartTime } = request.data;
  const text = request.data.text.trim();
  if (Number.isNaN(Date.parse(`${planDate}T00:00:00Z`))) {
    return fail(400, "INVALID_INPUT", "Неверная дата плана");
  }
  if (text.length < LIMITS.textMin || text.length > LIMITS.textMax) {
    return fail(
      400,
      "INVALID_INPUT",
      `Текст должен быть от ${LIMITS.textMin} до ${LIMITS.textMax} символов`,
    );
  }
  const calendarDate = localDate(now(), timezone);
  if (!calendarDate) return fail(400, "INVALID_INPUT", "Неизвестный часовой пояс");
  // the user's day: before the day boundary the night still belongs to the previous date
  const userToday = userDayDate(calendarDate, nowLocal, dayStartTime);
  const isToday = userToday === planDate;
  const status = planDateStatus({ planDate, nowDate: calendarDate, nowLocal, dayStartTime });
  const sanitizeOptions: SanitizeOptions = {
    planDate,
    userToday,
    calendarDate,
    nowLocal,
    allowNext: nextDayAllowed(status, text, nowLocal),
  };

  // 2. Daily limit (requests since 00:00 UTC; a retry is not a new request)
  const used = await deps.store.countParseRequestsSince(userId, utcDayStart(now()));
  if (used >= LIMITS.parsesPerDay) {
    return fail(429, "RATE_LIMIT", `Лимит ${LIMITS.parsesPerDay} разборов плана в сутки исчерпан`);
  }

  // 3. Context: skills + quests of the plan date and the next day
  const nextDate = addDaysIso(planDate, 1);
  const context = await deps.store.loadContext(userId, [planDate, nextDate]);

  // 4. Model: up to 2 attempts
  const result = await runAttempts<PlanItem[]>({
    provider: deps.provider,
    timeoutMs: deps.timeoutMs ?? LIMITS.timeoutMs,
    buildRequest: (retry) =>
      buildDayPlanRequest({
        planDate,
        nextDate,
        text,
        isToday,
        nowDate: calendarDate,
        nowLocal,
        dayStartTime,
        context,
        retry,
      }),
    validate(raw) {
      const parsed = ModelOutputSchema.safeParse(raw);
      return parsed.success
        ? { ok: true, value: sanitizeItems(parsed.data, context, sanitizeOptions) }
        : { ok: false, error: formatZodIssues(parsed.error) };
    },
    log: (record) =>
      deps.store.logAttempt({
        userId,
        planDate,
        inputText: text,
        model: deps.provider.model,
        attempt: record.attempt,
        rawOutput: record.rawOutput,
        parsedItems: record.value,
        status: record.status,
        errorMessage: record.errorMessage,
        latencyMs: record.latencyMs,
        usage: record.usage,
      }),
  });

  if (result.ok) return { ok: true, parseId: result.parseId, items: result.value };
  const messages = {
    AI_TIMEOUT: "Модель не ответила вовремя",
    AI_INVALID_OUTPUT: "Модель вернула некорректный ответ",
    AI_ERROR: "Не удалось разобрать план",
  } as const;
  return fail(result.status, result.code, messages[result.code]);
}
