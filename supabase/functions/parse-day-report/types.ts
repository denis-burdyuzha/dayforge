/** Contracts of parse-day-report: data access, context handed to the model, results. */
import type { AttemptStatus, RetryHint } from "../_shared/ai/attempts.ts";
import type { ErrorCode, Failure } from "../_shared/ai/http.ts";
import type { TokenUsage } from "../_shared/ai/provider.ts";
import type { SkillContext } from "../_shared/ai/skills.ts";
import type { DayEvent } from "./schema.ts";

export type { AttemptStatus } from "../_shared/ai/attempts.ts";
export type { ErrorCode } from "../_shared/ai/http.ts";
export { type AiProvider, ProviderError } from "../_shared/ai/provider.ts";
export type { SkillContext } from "../_shared/ai/skills.ts";

export interface PlannedQuestContext {
  id: string;
  title: string;
  skill: string | null;
  /** "HH:MM" when the quest came from a timed plan */
  startTime?: string | null;
}

export interface ParseContext {
  skills: SkillContext[];
  plannedQuests: PlannedQuestContext[];
}

/** Everything the prompt is built from */
export interface ProviderInput {
  reportDate: string;
  text: string;
  context: ParseContext;
  /** set on the retry after an invalid answer */
  retry?: RetryHint | undefined;
}

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
  usage: TokenUsage | null;
}

/** Data access used by the parser (Supabase in production, in-memory in tests) */
export interface DayReportStore {
  /** parse requests (attempt = 1) of the user since `sinceIso` */
  countParseRequestsSince(userId: string, sinceIso: string): Promise<number>;
  loadContext(userId: string, reportDate: string): Promise<ParseContext>;
  /** inserts the attempt row, returns its id */
  logAttempt(log: AttemptLog): Promise<string>;
}

export type ParseResult =
  { ok: true; parseId: string; events: DayEvent[] } | (Failure & { code: ErrorCode });
