/** Contracts of parse-day-report: AI provider, data access, context handed to the model, error codes. */
import type { AttributeCode, DayEvent } from "./schema.ts";

export interface SkillContext {
  id: string;
  name: string;
  aliases: string[];
  attributes: AttributeCode[];
}

export interface PlannedQuestContext {
  id: string;
  title: string;
  skill: string | null;
}

export interface ParseContext {
  skills: SkillContext[];
  plannedQuests: PlannedQuestContext[];
}

export interface ProviderInput {
  reportDate: string;
  text: string;
  context: ParseContext;
  /** set on the retry after an invalid answer: what was wrong (sent back to the model) */
  validationError?: string | undefined;
  previousOutput?: unknown;
}

/** The model behind the parser. Returns the raw tool input (validated by the caller). */
export interface AiProvider {
  readonly model: string;
  parseDayReport(input: ProviderInput, options: { signal: AbortSignal }): Promise<unknown>;
}

/** Thrown by a provider: `timeout` → retried once, `refusal`/`error` → AI_ERROR at once */
export class ProviderError extends Error {
  readonly kind: "timeout" | "error" | "invalid";

  constructor(
    kind: "timeout" | "error" | "invalid",
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "ProviderError";
    this.kind = kind;
  }
}

export type AttemptStatus = "ok" | "invalid_output" | "timeout" | "error";

export interface AttemptLog {
  userId: string;
  reportDate: string;
  inputText: string;
  model: string;
  attempt: 1 | 2;
  rawOutput: unknown;
  parsedEvents: DayEvent[] | null;
  status: AttemptStatus;
  errorMessage: string | null;
  latencyMs: number;
}

/** Data access used by the parser (Supabase in production, in-memory in tests) */
export interface DayReportStore {
  /** parse requests (attempt = 1) of the user since `sinceIso` */
  countParseRequestsSince(userId: string, sinceIso: string): Promise<number>;
  loadContext(userId: string, reportDate: string): Promise<ParseContext>;
  /** inserts the attempt row, returns its id */
  logAttempt(log: AttemptLog): Promise<string>;
}

export type ErrorCode =
  | "INVALID_INPUT"
  | "UNAUTHORIZED"
  | "RATE_LIMIT"
  | "AI_TIMEOUT"
  | "AI_INVALID_OUTPUT"
  | "AI_ERROR"
  | "METHOD_NOT_ALLOWED"
  | "INTERNAL";

export type ParseResult =
  | { ok: true; parseId: string; events: DayEvent[] }
  | { ok: false; status: number; code: ErrorCode; message: string };
