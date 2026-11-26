/**
 * Core of parse-day-report, independent of Deno and Supabase (dependencies are injected → unit-testable):
 * request validation → daily limit → context → model call (timeout 20 s, one retry on timeout / invalid
 * output) → Zod validation → sanitizing → every attempt logged.
 */
import type { z } from "zod";

import {
  type AttributeCode,
  type DayEvent,
  FALLBACK_ICON,
  LIMITS,
  type ModelOutput,
  ModelOutputSchema,
  ParseRequestSchema,
  SKILL_ICON_KEYS,
} from "./schema.ts";
import {
  type AiProvider,
  type AttemptStatus,
  type DayReportStore,
  type ErrorCode,
  type ParseContext,
  type ParseResult,
  ProviderError,
} from "./types.ts";

export interface ParseDeps {
  store: DayReportStore;
  provider: AiProvider;
  now?: () => Date;
  timeoutMs?: number;
}

const fail = (status: number, code: ErrorCode, message: string): ParseResult => ({
  ok: false,
  status,
  code,
  message,
});

export const normalizeSkillName = (name: string): string =>
  name.trim().replace(/\s+/g, " ").toLowerCase();

const capitalize = (s: string): string => (s ? s[0]!.toUpperCase() + s.slice(1) : s);

const formatZodIssues = (error: z.ZodError): string =>
  error.issues
    .slice(0, 10)
    .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("; ");

/**
 * Make validated model output safe to show and apply: hours into 0.1–8 (step 0.1), unknown / repeated
 * planned quest ids → null, skill ids that are not the user's → a new skill to review, names that match an
 * existing skill (name or alias) → that skill, icons outside the list → "misc", ≤ 2 attributes,
 * a note on every low-confidence event.
 */
export function sanitizeEvents(output: ModelOutput, context: ParseContext): DayEvent[] {
  const questIds = new Set(context.plannedQuests.map((q) => q.id));
  const usedQuests = new Set<string>();
  const skillIds = new Set(context.skills.map((s) => s.id));
  const skillByName = new Map<string, string>();
  for (const s of context.skills) {
    for (const n of [s.name, ...s.aliases]) skillByName.set(normalizeSkillName(n), s.id);
  }

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

    let skill: DayEvent["skill"];
    if (e.skill.kind === "existing") {
      if (skillIds.has(e.skill.skillId)) {
        skill = { kind: "existing", skillId: e.skill.skillId };
      } else {
        // the model referenced a skill the user does not have: offer it as a new one to review
        skill = {
          kind: "new",
          name: capitalize(e.description.slice(0, 40)),
          attributes: [],
          icon: FALLBACK_ICON,
        };
        confidence = "low";
        notes.push("навык не найден — проверь название и атрибуты");
      }
    } else if (e.skill.kind === "new") {
      const name = capitalize(e.skill.name.trim().replace(/\s+/g, " "));
      const existingId = skillByName.get(normalizeSkillName(name));
      if (existingId) {
        skill = { kind: "existing", skillId: existingId };
      } else {
        const attributes = [...new Set(e.skill.attributes)].slice(0, 2) as AttributeCode[];
        const icon = SKILL_ICON_KEYS.includes(e.skill.icon) ? e.skill.icon : FALLBACK_ICON;
        skill = { kind: "new", name, attributes, icon };
      }
    } else {
      skill = { kind: "none" };
    }

    if (confidence === "low" && notes.length === 0) notes.push("модель не уверена в этом событии");

    return {
      description: e.description.trim().slice(0, 200),
      hours,
      plannedQuestId,
      skill,
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
  const timeoutMs = deps.timeoutMs ?? LIMITS.timeoutMs;

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
  const dayStart = new Date(now());
  dayStart.setUTCHours(0, 0, 0, 0);
  const used = await deps.store.countParseRequestsSince(userId, dayStart.toISOString());
  if (used >= LIMITS.parsesPerDay) {
    return fail(429, "RATE_LIMIT", `Лимит ${LIMITS.parsesPerDay} разборов в сутки исчерпан`);
  }

  // 3. Context
  const context = await deps.store.loadContext(userId, reportDate);

  // 4. Model: up to 2 attempts
  let validationError: string | undefined;
  let previousOutput: unknown;
  let lastStatus: AttemptStatus = "error";

  for (const attempt of [1, 2] as const) {
    const started = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let raw: unknown = null;
    let status: AttemptStatus;
    let errorMessage: string | null = null;
    let events: DayEvent[] | null = null;

    try {
      raw = await deps.provider.parseDayReport(
        { reportDate, text, context, validationError, previousOutput },
        { signal: controller.signal },
      );
      const parsed = ModelOutputSchema.safeParse(raw);
      if (parsed.success) {
        events = sanitizeEvents(parsed.data, context);
        status = "ok";
      } else {
        status = "invalid_output";
        errorMessage = formatZodIssues(parsed.error);
      }
    } catch (error) {
      if (error instanceof ProviderError) {
        status =
          error.kind === "timeout"
            ? "timeout"
            : error.kind === "invalid"
              ? "invalid_output"
              : "error";
        errorMessage = error.message;
      } else {
        status = controller.signal.aborted ? "timeout" : "error";
        errorMessage = error instanceof Error ? error.message : String(error);
      }
    } finally {
      clearTimeout(timer);
    }

    const parseId = await deps.store.logAttempt({
      userId,
      reportDate,
      inputText: text,
      model: deps.provider.model,
      attempt,
      rawOutput: raw ?? null,
      parsedEvents: events,
      status,
      errorMessage,
      latencyMs: Date.now() - started,
    });

    if (status === "ok" && events) return { ok: true, parseId, events };

    lastStatus = status;
    if (status === "error") break; // provider / API failure: no retry
    if (status === "invalid_output") {
      validationError = errorMessage ?? "ответ не соответствует схеме";
      previousOutput = raw;
    } else {
      validationError = undefined;
      previousOutput = undefined;
    }
  }

  if (lastStatus === "timeout") return fail(504, "AI_TIMEOUT", "Модель не ответила вовремя");
  if (lastStatus === "invalid_output")
    return fail(502, "AI_INVALID_OUTPUT", "Модель вернула некорректный ответ");
  return fail(502, "AI_ERROR", "Не удалось разобрать отчёт");
}
